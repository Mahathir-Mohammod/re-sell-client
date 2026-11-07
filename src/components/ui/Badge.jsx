import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-900/30 dark:text-brand-200",
  neutral: "bg-ink-100 text-ink-700 ring-ink-500/20 dark:bg-ink-800 dark:text-ink-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-200",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-200",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  const tone = condition === "Like New" ? "brand" : condition === "Refurbished" ? "amber" : "neutral";
  return <Badge tone={tone}>{condition}</Badge>;
}