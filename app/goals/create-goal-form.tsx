import { createGoalAction } from "./actions";

export function CreateGoalForm() {
  return (
    <form
      action={createGoalAction}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-6 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">New goal</h2>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="goal-title"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Title
        </label>
        <input
          id="goal-title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. Ship the MVP"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="goal-description"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Description <span className="font-normal text-zinc-500">(optional)</span>
        </label>
        <textarea
          id="goal-description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="What does “done” look like?"
          className="resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>
      <button
        type="submit"
        className="inline-flex max-w-fit items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Add goal
      </button>
    </form>
  );
}
