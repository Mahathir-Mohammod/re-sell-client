"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { fetchReports, resolveReport } from "@/lib/api/reports";
import { deleteAdminProduct } from "@/lib/api/admin";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const TABS = [
  { value: "open", label: "Open" },
  { value: "reviewed", label: "Reviewed" },
  { value: "dismissed", label: "Dismissed" },
  { value: "", label: "All" },
];

const tone = (status) => (status === "open" ? "amber" : status === "reviewed" ? "brand" : "neutral");

function Reports() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("open");
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", tab],
    queryFn: () => fetchReports({ limit: 50, ...(tab && { status: tab }) }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const resolve = useMutation({
    mutationFn: ({ id, status }) => resolveReport(id, status),
    onSuccess: (_report, vars) => {
      toast.success(vars.status === "reviewed" ? "Marked as reviewed" : "Report dismissed");
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not update the report"),
  });

  const removeProduct = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      toast.success("Listing removed");
      setDeleting(null);
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not remove the listing"),
  });

  const reports = data?.items ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          {isLoading ? "Loading…" : `${data?.meta.total ?? 0} report(s)`} · buyers flag listings here
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="Report status">
        {TABS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={
              tab === value
                ? "rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-xl px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={tab === "open" ? "No open reports" : "Nothing here"}
          description={
            tab === "open"
              ? "Reported listings show up here for review."
              : "Try another tab to see resolved reports."
          }
        />
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {report.product ? (
                      <Link href={`/products/${report.product.slug}`} className="hover:text-brand-700">
                        {report.productTitle}
                      </Link>
                    ) : (
                      <span className="text-ink-500 line-through">{report.productTitle} (deleted)</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {report.reporterName} · {report.reporterEmail} · {formatDate(report.createdAt)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={tone(report.status)}>{report.status}</Badge>
                    <Badge tone="red">{report.reason}</Badge>
                  </div>
                  {report.details && (
                    <p className="mt-2 rounded-lg bg-ink-50 px-2 py-1 text-xs text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                      “{report.details}”
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {report.status === "open" && (
                    <>
                      <Button
                        size="sm"
                        loading={resolve.isPending && resolve.variables?.id === report._id}
                        onClick={() => resolve.mutate({ id: report._id, status: "reviewed" })}
                      >
                        Keep listing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={resolve.isPending && resolve.variables?.id === report._id}
                        onClick={() => resolve.mutate({ id: report._id, status: "dismissed" })}
                      >
                        Dismiss
                      </Button>
                    </>
                  )}
                  {report.product &&
                    (deleting === report.product._id ? (
                      <>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={removeProduct.isPending}
                          onClick={() => removeProduct.mutate(report.product._id)}
                        >
                          Confirm remove
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(report.product._id)}>
                        Remove listing
                      </Button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <Reports />
    </RequireAuth>
  );
}