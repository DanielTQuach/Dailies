import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureAppUser } from "@/lib/ensure-user";
import { listGoalsForUser } from "@/lib/goals";
import { CreateGoalForm } from "./create-goal-form";
import { GoalsList } from "./goals-list";

export default async function GoalsPage() {
  const user = await ensureAppUser();
  if (!user) redirect("/sign-in");

  const goals = await listGoalsForUser(user.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 p-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Goals
          </h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Create goals and track them here. API routes live under{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-900">
            /api/goals
          </code>
          .
        </p>
      </div>

      <CreateGoalForm />
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Your goals
        </h2>
        <GoalsList goals={goals} />
      </section>
    </div>
  );
}
