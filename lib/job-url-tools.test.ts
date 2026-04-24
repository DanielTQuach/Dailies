import { describe, expect, it } from "vitest";
import { cleanJobUrl, splitApplyAndJobDescriptionUrls } from "./job-url-tools";

describe("cleanJobUrl", () => {
  it("strips utm params", () => {
    expect(
      cleanJobUrl(
        "https://boards.greenhouse.io/acme/jobs/123?gh_src=abc&utm_source=linkedin&utm_medium=post"
      )
    ).toBe("https://boards.greenhouse.io/acme/jobs/123?gh_src=abc");
  });

  it("shortens LinkedIn collection URLs with currentJobId", () => {
    expect(
      cleanJobUrl(
        "https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4242424242&distance=25"
      )
    ).toBe("https://www.linkedin.com/jobs/view/4242424242");
  });

  it("normalizes linkedin /jobs/view/ path", () => {
    expect(cleanJobUrl("https://www.linkedin.com/jobs/view/999?utm_medium=share")).toBe(
      "https://www.linkedin.com/jobs/view/999"
    );
  });
});

describe("splitApplyAndJobDescriptionUrls", () => {
  it("duplicates a single cleaned URL into both fields", () => {
    const u = "https://example.com/apply?utm_source=x";
    expect(splitApplyAndJobDescriptionUrls(u)).toEqual({
      applyUrl: "https://example.com/apply",
      jobDescriptionUrl: "https://example.com/apply",
    });
  });

  it("uses two lines for apply vs JD", () => {
    expect(
      splitApplyAndJobDescriptionUrls(
        "https://greenhouse.io/x?utm_source=a\nhttps://company.com/careers/role?utm_campaign=b"
      )
    ).toEqual({
      applyUrl: "https://greenhouse.io/x",
      jobDescriptionUrl: "https://company.com/careers/role",
    });
  });
});
