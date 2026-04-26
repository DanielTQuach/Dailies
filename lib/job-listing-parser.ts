type ParsedJobListing = {
  title?: string;
  companyName?: string;
  location?: string;
  salaryRange?: string;
  source: "jsonld" | "workday" | "meta" | "heuristic";
};

function normalizeWhitespace(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const out = value.replace(/\s+/g, " ").trim();
  return out.length ? out : undefined;
}

function fromMeta(html: string, name: string, property = false): string | undefined {
  const attr = property ? "property" : "name";
  const pattern = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  const match = html.match(pattern);
  return normalizeWhitespace(match?.[1]);
}

function fromTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return normalizeWhitespace(match?.[1]);
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }
  return blocks;
}

function flattenJsonLd(input: unknown): Record<string, unknown>[] {
  if (!input || typeof input !== "object") return [];
  if (Array.isArray(input)) return input.flatMap((x) => flattenJsonLd(x));
  const obj = input as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) return (obj["@graph"] as unknown[]).flatMap((x) => flattenJsonLd(x));
  return [obj];
}

function asText(value: unknown): string | undefined {
  if (typeof value === "string") return normalizeWhitespace(value);
  if (typeof value === "number") return String(value);
  return undefined;
}

function extractSalary(job: Record<string, unknown>): string | undefined {
  const raw = job.baseSalary ?? job.estimatedSalary;
  if (!raw || typeof raw !== "object") return undefined;
  const salary = raw as Record<string, unknown>;
  const currency = asText(salary.currency) ?? "USD";
  const value = salary.value;
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const min = asText(v.minValue);
  const max = asText(v.maxValue);
  const unit = asText(v.unitText);
  if (min && max) return `${currency} ${min}-${max}${unit ? ` / ${unit}` : ""}`;
  if (min) return `${currency} ${min}${unit ? ` / ${unit}` : ""}`;
  return undefined;
}

function extractLocation(job: Record<string, unknown>): string | undefined {
  const jl = job.jobLocation;
  const entries = Array.isArray(jl) ? jl : jl ? [jl] : [];
  for (const item of entries) {
    if (!item || typeof item !== "object") continue;
    const addr = (item as Record<string, unknown>).address;
    if (!addr || typeof addr !== "object") continue;
    const a = addr as Record<string, unknown>;
    const city = asText(a.addressLocality);
    const region = asText(a.addressRegion);
    const country = asText(a.addressCountry);
    const parts = [city, region, country].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return asText(job.jobLocationType);
}

function parseJobPostingFromJsonLd(html: string): Omit<ParsedJobListing, "source"> | null {
  const blocks = extractJsonLdBlocks(html);
  const nodes = blocks.flatMap((b) => flattenJsonLd(b));
  for (const node of nodes) {
    const type = asText(node["@type"]);
    if (!type || !/JobPosting/i.test(type)) continue;
    const companyObj = node.hiringOrganization;
    const companyName =
      companyObj && typeof companyObj === "object"
        ? asText((companyObj as Record<string, unknown>).name)
        : asText(companyObj);
    return {
      title: asText(node.title),
      companyName,
      location: extractLocation(node),
      salaryRange: extractSalary(node),
    };
  }
  return null;
}

function parseFallback(html: string, hostname: string): ParsedJobListing {
  const ogTitle = fromMeta(html, "og:title", true);
  const titleTag = fromTitle(html);
  const title = normalizeWhitespace(ogTitle ?? titleTag);
  const companyMeta = fromMeta(html, "og:site_name", true) ?? fromMeta(html, "twitter:site");
  const location =
    fromMeta(html, "jobLocation") ??
    fromMeta(html, "og:description", true)?.match(/(?:in|at)\s+([A-Z][^,.;|]+(?:,\s*[A-Z]{2})?)/)?.[1];
  const salary =
    fromMeta(html, "salary") ??
    html.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/\s*(?:year|yr|hour|hr))?/i)?.[0];

  const companyName = normalizeWhitespace(companyMeta) ?? hostname.replace(/^www\./, "").split(".")[0];
  return {
    title,
    companyName,
    location: normalizeWhitespace(location),
    salaryRange: normalizeWhitespace(salary),
    source: "meta",
  };
}

function isWorkdayHost(hostname: string): boolean {
  return /(?:^|\.)(?:myworkdayjobs\.com|wd\d+\.myworkdayjobs\.com)$/i.test(hostname);
}

function parseWorkdayLocationFromPath(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.findIndex((p) => p.toLowerCase() === "job");
  if (idx === -1 || !parts[idx + 1]) return undefined;
  return normalizeWhitespace(decodeURIComponent(parts[idx + 1]).replace(/-/g, ", "));
}

function parseWorkdayCompanyFromHost(hostname: string): string | undefined {
  const withoutWww = hostname.replace(/^www\./i, "");
  const first = withoutWww.split(".")[0];
  if (!first) return undefined;
  const cleaned = first.replace(/(External|Internal)?CareerSite\d*$/i, "");
  return normalizeWhitespace(cleaned.replace(/[-_]+/g, " "));
}

function parseWorkdayTitle(rawTitle: string | undefined): string | undefined {
  const t = normalizeWhitespace(rawTitle);
  if (!t) return undefined;
  return normalizeWhitespace(t.split("|")[0]);
}

function parseWorkdaySalary(html: string): string | undefined {
  const patterns = [
    /(?:salary|compensation|pay)\s*(?:range)?\s*[:\-]?\s*(\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/\s*(?:year|yr|hour|hr))?)/i,
    /(\$[\d,]+(?:\s*-\s*\$[\d,]+)\s*(?:USD)?\s*\/\s*(?:year|yr|hour|hr))/i,
  ];
  for (const re of patterns) {
    const m = html.match(re)?.[1];
    if (m) return normalizeWhitespace(m);
  }
  return undefined;
}

function parseWorkday(url: URL, html: string): Omit<ParsedJobListing, "source"> | null {
  if (!isWorkdayHost(url.hostname)) return null;
  const title = parseWorkdayTitle(fromMeta(html, "og:title", true) ?? fromTitle(html));
  const companyName =
    normalizeWhitespace(fromMeta(html, "og:site_name", true)) ?? parseWorkdayCompanyFromHost(url.hostname);
  const location =
    normalizeWhitespace(
      fromMeta(html, "jobLocation") ??
        fromMeta(html, "og:description", true)?.match(/(?:Location|located in)[:\s]+([^.|;]+)/i)?.[1],
    ) ?? parseWorkdayLocationFromPath(url.pathname);
  const salaryRange = parseWorkdaySalary(html) ?? normalizeWhitespace(fromMeta(html, "salary"));

  if (!title && !companyName && !location && !salaryRange) return null;
  return { title, companyName, location, salaryRange };
}

export async function parseJobListingFromUrl(url: string): Promise<ParsedJobListing> {
  const parsedUrl = new URL(url);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; dailies/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) {
    throw new Error(`Unable to fetch listing (${res.status})`);
  }
  const html = await res.text();
  const jsonLd = parseJobPostingFromJsonLd(html);
  if (jsonLd && (jsonLd.title || jsonLd.companyName || jsonLd.location || jsonLd.salaryRange)) {
    return { ...jsonLd, source: "jsonld" };
  }
  const wd = parseWorkday(parsedUrl, html);
  if (wd) return { ...wd, source: "workday" };
  const parsed = parseFallback(html, parsedUrl.hostname);
  return {
    ...parsed,
    source: parsed.title || parsed.companyName || parsed.location || parsed.salaryRange ? "meta" : "heuristic",
  };
}

export type { ParsedJobListing };
