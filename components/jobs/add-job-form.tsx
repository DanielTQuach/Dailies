"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { JOB_STAGE_FLOW } from "@/lib/job-stages";
import { createJobAction } from "@/app/jobs/actions";

function SubmitButton({ idle, pendingLabel }: { idle: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-zinc-300 bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {pending ? pendingLabel : idle}
    </button>
  );
}

export function AddJobForm() {
  const [state, action] = useActionState(async (_prev: string | null, formData: FormData) => {
    try {
      await createJobAction(formData);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Could not add job.";
    }
  }, null);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add application</h2>
      <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        Use the link converter on the right, then paste cleaned URLs here if you like.
      </p>

      <form action={action} className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Company <span className="text-red-600">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            maxLength={120}
            placeholder="Acme Corp"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="roleTitle" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Role / title
          </label>
          <input
            id="roleTitle"
            name="roleTitle"
            placeholder="Software Engineer"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="applyUrl" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Apply URL
          </label>
          <input
            id="applyUrl"
            name="applyUrl"
            type="url"
            placeholder="https://…"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="jobDescriptionUrl" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Job description URL
          </label>
          <input
            id="jobDescriptionUrl"
            name="jobDescriptionUrl"
            type="url"
            placeholder="https://…"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div>
          <label htmlFor="stage" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Starting stage
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue="SAVED"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            {JOB_STAGE_FLOW.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="Recruiter name, comp band, stack…"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        <div className="flex items-end sm:col-span-2">
          <SubmitButton idle="Add to pipeline" pendingLabel="Adding…" />
        </div>
      </form>
      {state ? <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{state}</p> : null}
    </div>
  );
}
