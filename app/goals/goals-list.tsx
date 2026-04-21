import type { Goal, ProgressEntry } from "@prisma/client";
import Link from "next/link";
import { deleteGoalAction, logProgressAction, updateGoalAction } from "./actions";
import { SubmitButton } from "./submit-button";

export type GoalWithProgress = Goal & {
  progressEntries: ProgressEntry[];
};

type GoalsListProps = {
  goals: GoalWithProgress[];
};

export function GoalsList({ goals }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No goals yet — add one above to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {goals.map((g) => (
        <li
          key={g.id}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{g.title}</h3>
              {g.description ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                  {g.description}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <Link
                  href={`/goals/${g.id}`}
                  className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                >
                  Full timeline
                </Link>
              </div>
            </div>
            <form action={deleteGoalAction}>
              <input type="hidden" name="goalId" value={g.id} />
              <SubmitButton
                idleLabel="Delete"
                pendingLabel="Deleting..."
                className="text-sm font-medium text-red-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-70 dark:text-red-400"
              />
            </form>
          </div>

          <details className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
            <summary className="cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Edit goal
            </summary>
            <form action={updateGoalAction} className="mt-3 flex flex-col gap-3">
              <input type="hidden" name="goalId" value={g.id} />
              <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                Title
                <input
                  name="title"
                  type="text"
                  required
                  maxLength={120}
                  defaultValue={g.title}
                  className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                Description
                <textarea
                  name="description"
                  rows={3}
                  maxLength={2000}
                  defaultValue={g.description ?? ""}
                  className="resize-y rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </label>
              <SubmitButton
                idleLabel="Save changes"
                pendingLabel="Saving..."
                className="max-w-fit rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              />
            </form>
          </details>

          <form action={logProgressAction} className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-200 p-3 dark:border-zinc-700">
            <input type="hidden" name="goalId" value={g.id} />
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Log progress
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                Amount
                <input
                  name="amount"
                  type="number"
                  min={1}
                  max={1000000}
                  defaultValue={1}
                  className="w-24 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                Note (optional)
                <input
                  name="note"
                  type="text"
                  maxLength={500}
                  placeholder="What did you do?"
                  className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
              <div className="flex items-end">
                <SubmitButton
                  idleLabel="Add entry"
                  pendingLabel="Adding..."
                  className="rounded-full bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                />
              </div>
            </div>
          </form>

          {g.progressEntries.length > 0 ? (
            <ul className="flex flex-col gap-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
              {g.progressEntries.map((e) => (
                <li key={e.id} className="flex flex-wrap gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">+{e.amount}</span>
                  {e.note ? <span>{e.note}</span> : null}
                  <span className="text-xs text-zinc-400">
                    {new Date(e.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-500">No entries yet.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
