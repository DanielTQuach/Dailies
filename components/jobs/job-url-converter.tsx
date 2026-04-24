"use client";

import { useMemo, useState } from "react";
import { splitApplyAndJobDescriptionUrls } from "@/lib/job-url-tools";

export function JobUrlConverter() {
  const [input, setInput] = useState("");
  const parsed = useMemo(() => splitApplyAndJobDescriptionUrls(input), [input]);

  const copy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Link converter</h2>
      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        Paste messy tracking URLs. Line 1 = apply link, line 2 (optional) = job description link. UTM params are
        stripped; LinkedIn collection links collapse to a stable <span className="font-mono">/jobs/view/&lt;id&gt;</span>{" "}
        URL.
      </p>

      <label htmlFor="url-paste" className="mt-3 block text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
        Paste URL(s)
      </label>
      <textarea
        id="url-paste"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder={"https://www.linkedin.com/jobs/collections/...?currentJobId=123\nhttps://company.com/jd?utm_source=linkedin"}
        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-[11px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">Apply URL</p>
          <div className="mt-1 flex gap-1">
            <input
              readOnly
              value={parsed.applyUrl}
              className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-[10px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <button
              type="button"
              onClick={() => copy(parsed.applyUrl)}
              disabled={!parsed.applyUrl}
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Copy
            </button>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">Job description URL</p>
          <div className="mt-1 flex gap-1">
            <input
              readOnly
              value={parsed.jobDescriptionUrl}
              className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-[10px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <button
              type="button"
              onClick={() => copy(parsed.jobDescriptionUrl)}
              disabled={!parsed.jobDescriptionUrl}
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
