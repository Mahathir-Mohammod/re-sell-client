import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
  red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200",
  neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "brand", loading }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        {Icon && (
          <span className={cn("grid size-8 place-items-center rounded-lg", tones[tone])}>
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
        {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-ink-100 dark:bg-ink-800" /> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}