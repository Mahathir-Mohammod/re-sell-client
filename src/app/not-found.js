import { Compass, Recycle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        <Recycle className="size-7" aria-hidden />
      </span>

      <p className="mt-5 font-mono text-sm font-semibold uppercase tracking-widest text-ink-400">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">This page has been resold</h1>
      <p className="mt-2 text-sm text-ink-500">
        The link may be broken, or the listing was removed. Nothing is wasted — try browsing instead.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products">
          <Compass className="size-4" aria-hidden /> Browse products
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}