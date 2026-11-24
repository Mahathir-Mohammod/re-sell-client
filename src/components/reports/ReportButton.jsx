"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";
import { REPORT_REASONS, createReport } from "@/lib/api/reports";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function ReportButton({ productId, productTitle }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("misleading");
  const [details, setDetails] = useState("");

  const submit = useMutation({
    mutationFn: () => createReport({ productId, reason, details: details.trim() || undefined }),
    onSuccess: () => {
      toast.success("Thanks — an admin will review this listing");
      setOpen(false);
      setDetails("");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not send the report"),
  });

  const onOpen = () => {
    if (!isAuthenticated) {
      toast.info("Sign in to report a listing");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-red-600"
      >
        <Flag className="size-4" aria-hidden /> Report this listing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          onClick={() => setOpen(false)}
        >
          <form
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-ink-900"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              submit.mutate();
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="report-title" className="font-semibold">
                Report “{productTitle}”
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium">Why are you reporting it?</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-800"
              >
                {REPORT_REASONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm">
              <span className="mb-1 block font-medium">
                Anything else? <span className="font-normal text-ink-500">(optional)</span>
              </span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Add details that would help an admin review this"
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
              />
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" loading={submit.isPending}>
                Send report
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}