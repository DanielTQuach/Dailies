import type { Goal } from "@prisma/client";
import { deleteGoalAction } from "./actions";

type GoalsListProps = {
  goals: Goal[];
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
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{g.title}</h3>
              {g.description ? (
                <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {g.description}
                </p>
              ) : null}
            </div>
            <form action={deleteGoalAction}>
              <input type="hidden" name="goalId" value={g.id} />
              <button
                type="submit"
                className="text-sm font-medium text-red-600 underline-offset-2 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
