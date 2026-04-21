import { Skeleton } from "@/components/ui/skeleton";

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-4 pt-4 pb-1 dark:border-zinc-800">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-2 h-3 w-full max-w-[200px]" />
      </div>
      <div className="px-4 pt-3 pb-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="mt-2 h-3 w-36" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-48" />
          </div>
          <div className="p-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-40" />
          </div>
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {Array.from({ length: 4 }).map((__, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoalsPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 p-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <Skeleton className="h-5 w-full max-w-xs" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-8 w-full max-w-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoalTimelinePageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function StreakPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-16 w-48 rounded-md" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>
          <div className="p-4">
            <Skeleton className="h-[220px] w-full rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <div className="p-4">
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function OnboardingPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function PlaceholderTabSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl p-8">
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900/40">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />
        <Skeleton className="mt-6 h-10 w-40 rounded-md" />
      </div>
    </div>
  );
}
