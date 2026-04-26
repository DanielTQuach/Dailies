"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { JOB_STAGE_LABEL, JOB_STAGES, type JobStageValue } from "@/lib/jobs-shared";
import {
  createJobAction,
  parseJobListingAction,
  updateJobStageAction,
  type JobCreateState,
  type JobStageState,
} from "./actions";

type JobRow = {
  id: string;
  title: string;
  stage: JobStageValue;
  location: string | null;
  salaryRange: string | null;
  company: { name: string } | null;
};

type JobsClientProps = {
  jobs: JobRow[];
};

const TABS = ["kanban", "table", "funnel"] as const;
type Tab = (typeof TABS)[number];

function SaveButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      className="rounded-md border border-zinc-300 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {label}
      <span className="sr-only">{pendingLabel}</span>
    </button>
  );
}

export function JobsClient({ jobs }: JobsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("kanban");
  const [createState, createAction] = useActionState(createJobAction, null as JobCreateState | null);
  const [stageState, stageAction] = useActionState(updateJobStageAction, null as JobStageState | null);
  const [isParsing, startParsingTransition] = useTransition();
  const [parseError, setParseError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [notes, setNotes] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<JobStageValue, JobRow[]>();
    for (const stage of JOB_STAGES) map.set(stage, []);
    for (const job of jobs) {
      const bucket = map.get(job.stage);
      if (bucket) bucket.push(job);
    }
    return map;
  }, [jobs]);

  const funnel = useMemo(() => {
    const count = (stage: JobStageValue) => grouped.get(stage)?.length ?? 0;
    const preApply = count("WISHLIST") + count("SAVED");
    const appliedTotal =
      count("APPLIED") +
      count("PHONE") +
      count("OA") +
      count("ONSITE") +
      count("OFFER") +
      count("REJECTED") +
      count("WITHDRAWN");
    const interviewing = count("PHONE") + count("OA") + count("ONSITE");
    const offers = count("OFFER");
    const rejected = count("REJECTED");
    const responseRate = appliedTotal ? Math.round(((appliedTotal - count("APPLIED")) / appliedTotal) * 100) : 0;
    const interviewRate = appliedTotal ? Math.round((interviewing / appliedTotal) * 100) : 0;
    const offerRate = appliedTotal ? Math.round((offers / appliedTotal) * 100) : 0;
    return { preApply, appliedTotal, interviewing, offers, rejected, responseRate, interviewRate, offerRate };
  }, [grouped]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add application</h2>
        <form action={createAction} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <label htmlFor="job-url" className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Job listing URL
            </label>
            <div className="flex items-center gap-1">
              <input
                id="job-url"
                name="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://jobs.example.com/..."
                className="w-80 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              />
              <button
                type="button"
                disabled={!url.trim() || isParsing}
                onClick={() => {
                  setParseError(null);
                  const currentUrl = url.trim();
                  startParsingTransition(async () => {
                    const parsed = await parseJobListingAction(currentUrl);
                    if (parsed.error) {
                      setParseError(parsed.error);
                      return;
                    }
                    setTitle(parsed.title ?? "");
                    setCompanyName(parsed.companyName ?? "");
                    setLocation(parsed.location ?? "");
                    setSalaryRange(parsed.salaryRange ?? "");
                  });
                }}
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {isParsing ? "Parsing..." : "Autofill"}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Role
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Software Engineer"
              className="w-56 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="companyName" className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Company (optional)
            </label>
            <input
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme"
              className="w-48 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Location (optional)
            </label>
            <input
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA"
              className="w-56 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="salaryRange" className="text-[11px] text-zinc-700 dark:text-zinc-300">
              Salary (optional)
            </label>
            <input
              id="salaryRange"
              name="salaryRange"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="$140,000-$180,000 / year"
              className="w-56 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <input
            name="stage"
            value="APPLIED"
            readOnly
            type="hidden"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            name="notes"
            placeholder="Notes (optional)"
            className="w-72 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
          <div className="flex items-center">
            <SaveButton label="Add" pendingLabel="Adding..." />
          </div>
        </form>
        {parseError ? (
          <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{parseError}</p>
        ) : (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Paste a listing URL and click <span className="font-medium text-zinc-700 dark:text-zinc-200">Autofill</span> to parse role, company, location, and salary.
          </p>
        )}
        {createState?.error ? (
          <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{createState.error}</p>
        ) : createState?.ok ? (
          <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">Application saved.</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md border px-3 py-1.5 text-xs ${
                activeTab === tab
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {tab === "kanban" ? "Kanban" : tab === "table" ? "Table" : "Funnel"}
            </button>
          ))}
        </div>

        {activeTab === "kanban" ? (
          jobs.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              No applications yet.
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {JOB_STAGES.map((stage) => (
                <div key={stage} className="w-60 shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="border-b border-zinc-100 px-2 py-1.5 text-xs font-medium dark:border-zinc-800">
                    {JOB_STAGE_LABEL[stage]}
                  </div>
                  <div className="space-y-1.5 p-2">
                    {(grouped.get(stage) ?? []).map((job) => (
                      <div key={job.id} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{job.title}</p>
                        <p className="text-zinc-600 dark:text-zinc-400">{job.company?.name ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}

        {activeTab === "table" ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full min-w-[760px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Company</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Salary</th>
                  <th className="p-2.5">Stage</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80">
                    <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-50">{job.title}</td>
                    <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{job.company?.name ?? "—"}</td>
                    <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{job.location ?? "—"}</td>
                    <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{job.salaryRange ?? "—"}</td>
                    <td className="p-2.5">
                      <form action={stageAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={job.id} />
                        <select
                          name="stage"
                          defaultValue={job.stage}
                          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                        >
                          {JOB_STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {JOB_STAGE_LABEL[stage]}
                            </option>
                          ))}
                        </select>
                        <SaveButton label="Save" pendingLabel="Saving..." />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stageState?.error ? (
              <p className="p-2.5 text-[11px] text-red-600 dark:text-red-400">{stageState.error}</p>
            ) : null}
          </div>
        ) : null}

        {activeTab === "funnel" ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Tracked</p>
              <p className="font-mono text-2xl text-zinc-900 dark:text-zinc-50">{jobs.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Pre-apply</p>
              <p className="font-mono text-2xl text-zinc-900 dark:text-zinc-50">{funnel.preApply}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Response rate</p>
              <p className="font-mono text-2xl text-zinc-900 dark:text-zinc-50">{funnel.responseRate}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Interview rate</p>
              <p className="font-mono text-2xl text-zinc-900 dark:text-zinc-50">{funnel.interviewRate}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Offer rate</p>
              <p className="font-mono text-2xl text-zinc-900 dark:text-zinc-50">{funnel.offerRate}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[11px] text-zinc-600 shadow-sm md:col-span-2 xl:col-span-5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Applied+ {funnel.appliedTotal} · Interviewing {funnel.interviewing} · Offers {funnel.offers} · Rejected{" "}
              {funnel.rejected}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
