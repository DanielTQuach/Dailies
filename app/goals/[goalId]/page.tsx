import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { getGoalForUser } from "@/lib/goals";
import { listProgressForGoalPage } from "@/lib/progress";

type PageProps = {
  params: Promise<{ goalId: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

export default async function GoalTimelinePage({ params, searchParams }: PageProps) {
  const { goalId } = await params;
  const query = searchParams ? await searchParams : undefined;
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const goal = await getGoalForUser(user.id, goalId);
  if (!goal) notFound();

  const result = await listProgressForGoalPage(user.id, goalId, {
    take: 100,
    cursor: query?.cursor,
  });
  if (!result) notFound();
  const { entries, nextCursor } = result;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/goals"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← All goals
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{goal.title}</h1>
        {goal.description ? (
          <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{goal.description}</p>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-500">No description.</p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing {entries.length} entries per page.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No progress logged yet — go back to Goals to add an entry.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">+{e.amount}</span>
                {e.note ? <span className="text-zinc-700 dark:text-zinc-300">{e.note}</span> : null}
              </div>
              <time className="text-xs text-zinc-500 dark:text-zinc-400" dateTime={e.createdAt.toISOString()}>
                {new Date(e.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
      {nextCursor ? (
        <div className="flex justify-end">
          <Link
            href={`/goals/${goalId}?cursor=${encodeURIComponent(nextCursor)}`}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Load older entries
          </Link>
        </div>
      ) : null}
    </div>
  );
}
