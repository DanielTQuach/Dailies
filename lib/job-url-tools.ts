/** Query params commonly stripped when sharing job links. */
const TRACKING_PARAM_PREFIXES = ["utm_"];
const TRACKING_PARAM_NAMES = new Set([
  "fbclid",
  "gclid",
  "mc_eid",
  "igshid",
  "ref",
  "refId",
  "source",
  "trk",
]);

/**
 * Normalizes a pasted job / apply URL: strips tracking params, shortens some LinkedIn collection URLs.
 */
export function cleanJobUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const host = url.hostname.toLowerCase();

  if (host.includes("linkedin.com")) {
    const fromQuery = url.searchParams.get("currentJobId") ?? url.searchParams.get("jobId");
    if (fromQuery && /^\d+$/.test(fromQuery)) {
      return `https://www.linkedin.com/jobs/view/${fromQuery}`;
    }
    const m = url.pathname.match(/\/jobs\/view\/(\d+)/i);
    if (m?.[1]) {
      return `https://www.linkedin.com/jobs/view/${m[1]}`;
    }
  }

  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (TRACKING_PARAM_NAMES.has(lower)) {
      url.searchParams.delete(key);
      continue;
    }
    if (TRACKING_PARAM_PREFIXES.some((p) => lower.startsWith(p))) {
      url.searchParams.delete(key);
    }
  }

  url.hash = "";
  return url.toString();
}

/**
 * First non-empty line → apply URL, second line (optional) → job description URL.
 * If only one line, both fields get the same cleaned URL (common when JD and apply are the same page).
 */
export function splitApplyAndJobDescriptionUrls(block: string): {
  applyUrl: string;
  jobDescriptionUrl: string;
} {
  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { applyUrl: "", jobDescriptionUrl: "" };
  const first = cleanJobUrl(lines[0]);
  if (lines.length === 1) return { applyUrl: first, jobDescriptionUrl: first };
  return { applyUrl: first, jobDescriptionUrl: cleanJobUrl(lines[1]) };
}
