"use client";

import { useMemo } from "react";
import { deleteJobAction, updateJobStageAction } from "@/app/jobs/actions";
import { JOB_STAGE_FLOW, type JobStage } from "@/lib/job-stages";

export type SerializedJobApplication = {
  id: string;
  companyName: string;
  roleTitle: string | null;
  stage: JobStage;
  applyUrl: string | null;
  jobDescriptionUrl: string | null;
  notes: string | null;
  updatedAt: string;
};

function Chevron() {
  return (
    <span className="hidden shrink-0 select-none text-zinc-300 dark:text-zinc-600 sm:inline" aria-hidden>
      →
    </span>
  );
}

function JobCard({ job }: { job: SerializedJobApplication }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{job.companyName}</p>
      {job.roleTitle ? <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">{job.roleTitle}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
        {job.applyUrl ? (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
          >
            Apply
          </a>
        ) : null}
        {job.jobDescriptionUrl ? (
          <a
            href={job.jobDescriptionUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
          >
            JD
          </a>
        ) : null}
      </div>
      {job.notes ? (
        <p className="mt-2 line-clamp-3 text-[10px] text-zinc-600 dark:text-zinc-400">{job.notes}</p>
      ) : null}

      <form action={updateJobStageAction} className="mt-2 flex flex-wrap items-end gap-1.5">
        <input type="hidden" name="jobId" value={job.id} />
        <label htmlFor={`stage-${job.id}`} className="sr-only">
          Move stage
        </label>
        <select
          id={`stage-${job.id}`}
          name="stage"
          defaultValue={job.stage}
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-1.5 py-1 text-[10px] text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          {JOB_STAGE_FLOW.map((s) => (
            <option key={s.value} value={s.value}>
              {s.short}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[10px] font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Move
        </button>
      </form>

      <form
        action={deleteJobAction}
        className="mt-2"
        onSubmit={(e) => {
          if (!window.confirm(`Remove ${job.companyName} from the tracker?`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="jobId" value={job.id} />
        <button
          type="submit"
          className="text-[10px] font-medium text-red-600 underline-offset-2 hover:underline dark:text-red-400"
        >
          Remove
        </button>
      </form>
    </div>
  );
}

export function JobPipelineBoard({ applications }: { applications: SerializedJobApplication[] }) {
  const byStage = useMemo(() => {
    const map = new Map<JobStage, SerializedJobApplication[]>();
    for (const s of JOB_STAGE_FLOW) map.set(s.value, []);
    for (const app of applications) {
      const bucket = map.get(app.stage);
      if (bucket) bucket.push(app);
    }
    return map;
  }, [applications]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Pipeline</h2>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Drag-free flow · move cards by stage</p>
      </div>

      <div className="mt-3 overflow-x-auto pb-2">
        <div className="flex min-w-max items-start gap-1 sm:gap-2">
          {JOB_STAGE_FLOW.map((col, idx) => (
            <div key={col.value} className="flex items-start gap-1 sm:gap-2">
              {idx > 0 ? <Chevron /> : null}
              <div className="w-[200px] shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="border-b border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
                  <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-50">{col.label}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {byStage.get(col.value)?.length ?? 0} apps
                  </p>
                </div>
                <div className="space-y-2 p-2">
                  {(byStage.get(col.value) ?? []).map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                  {(byStage.get(col.value) ?? []).length === 0 ? (
                    <p className="px-1 py-3 text-center text-[10px] text-zinc-400 dark:text-zinc-500">—</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
