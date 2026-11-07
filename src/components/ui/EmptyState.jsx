import { PackageOpen } from "lucide-react";

export function EmptyState({ title, description, action, icon: Icon = PackageOpen }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center dark:border-ink-800">
      <Icon className="size-10 text-ink-300" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}