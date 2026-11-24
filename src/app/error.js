"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";

// Route-level boundary. Next passes `reset()` to retry the segment render, which is
// what the button uses — no full page reload.
export default function Error({ error, reset }) {
  useEffect(() => {
    // surface it in the console for debugging; in production this is where a
    // reporter (Sentry etc.) would be wired in
    console.error("Route error:", error);
  }, [error]);

  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300">
        <TriangleAlert className="size-7" aria-hidden />
      </span>

      <h1 className="mt-5 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-500">
        {isOffline
          ? "You look offline. Check your connection and try again."
          : "This page could not load. The API may be waking up — a retry usually fixes it."}
      </p>

      {error?.digest && (
        <p className="mt-3 font-mono text-xs text-ink-400">Reference: {error.digest}</p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>
          <RotateCw className="size-4" aria-hidden /> Try again
        </Button>
        <ButtonLink href="/" variant="outline">
          Back home
        </ButtonLink>
      </div>

      <p className="mt-6 text-xs text-ink-400">
        Still stuck?{" "}
        <Link href="/products" className="font-medium text-brand-700 hover:underline">
          Browse products
        </Link>{" "}
        while we sort it out.
      </p>
    </div>
  );
}