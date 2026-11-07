import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-700",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 focus-visible:ring-brand-500 dark:border-ink-700 dark:bg-transparent dark:text-ink-100 dark:hover:bg-ink-800",
  ghost: "text-ink-600 hover:bg-ink-100 focus-visible:ring-ink-400 dark:text-ink-300 dark:hover:bg-ink-800",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function Button({ variant = "primary", size = "md", className, loading, children, ...props }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}