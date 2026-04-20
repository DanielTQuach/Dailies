import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40",
        className
      )}
    >
      <p className="text-[12px] font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="mt-1 max-w-sm text-[11px] text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}
