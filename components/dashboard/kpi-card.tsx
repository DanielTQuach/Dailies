import { cn } from "@/lib/cn";

export function KpiCard({
  title,
  hint,
  value,
  sub,
  className,
}: {
  title: string;
  hint?: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
    >
      <div className="border-b border-zinc-100 px-4 pt-4 pb-1 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
        ) : null}
      </div>
      <div className="px-4 pt-3 pb-4">
        <p className="font-mono text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50">
          {value}
        </p>
        {sub ? <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{sub}</p> : null}
      </div>
    </div>
  );
}
