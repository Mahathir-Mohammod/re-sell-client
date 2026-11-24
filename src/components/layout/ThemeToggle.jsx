"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const skeleton = <div className="size-9 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" aria-hidden />;

// The stored theme only exists on the client. This reads false during SSR/hydration
// and true afterwards, without a setState-in-effect (which eslint forbids here).
const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) return skeleton;

  const current = theme ?? "system";

  // Narrow screens only have room for one button, so it cycles instead.
  if (compact) {
    const index = OPTIONS.findIndex((option) => option.value === current);
    const next = OPTIONS[(index + 1) % OPTIONS.length];
    const { icon: Icon, label } = OPTIONS[index];
    return (
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        aria-label={`${label} theme, switch to ${next.label}`}
        title={`${label} theme`}
        className="grid size-9 place-items-center rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
      >
        <Icon className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex items-center gap-0.5 rounded-xl border border-ink-200 p-0.5 dark:border-ink-700"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={
              active
                ? "grid size-8 place-items-center rounded-lg bg-brand-600 text-white"
                : "grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
            }
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}