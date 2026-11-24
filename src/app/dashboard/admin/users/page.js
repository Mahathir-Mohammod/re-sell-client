"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ShieldBan, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteAdminUser, fetchAdminUsers, updateAdminUser } from "@/lib/api/admin";
import { setSellerVerified } from "@/lib/api/reports";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/providers/AuthProvider";
import { formatDate } from "@/lib/utils";

const ROLES = ["buyer", "seller", "admin"];

function AdminUsers() {
  const queryClient = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [deleting, setDeleting] = useState(null);
  const deferredSearch = useDeferredValue(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", deferredSearch, role, status],
    queryFn: () =>
      fetchAdminUsers({
        limit: 50,
        ...(deferredSearch && { search: deferredSearch }),
        ...(role && { role }),
        ...(status && { status }),
      }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const update = useMutation({
    mutationFn: ({ id, patch }) => updateAdminUser(id, patch),
    onSuccess: (_data, vars) => {
      toast.success(vars.patch.status === "blocked" ? "User blocked" : "User updated");
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not update the user"),
  });

  const verify = useMutation({
    mutationFn: ({ id, verified }) => setSellerVerified(id, verified),
    onSuccess: (_data, vars) => {
      toast.success(vars.verified ? "Seller verified" : "Verification removed");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not update verification"),
  });

  const remove = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success("User deleted");
      setDeleting(null);
      refresh();
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not delete the user"),
  });

  const items = data?.items ?? [];

  const filter =
    "rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm dark:border-ink-700 dark:bg-ink-900";

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage users</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isLoading ? "Loading…" : `${data?.meta.total ?? 0} account(s)`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search users"
            className={`w-56 ${filter}`}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className={filter}>
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={filter}>
            <option value="">Any status</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
          </select>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No matching users" description="Try a different search or filter." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-ink-900">
              <tr>
                <th scope="col" className="px-4 py-3">Account</th>
                <th scope="col" className="px-4 py-3">Joined</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {items.map((user) => {
                const isSelf = user._id === me?.id;
                const busy = update.isPending && update.variables?.id === user._id;
                return (
                  <tr key={user._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {user.name} {isSelf && <span className="text-xs text-ink-400">(you)</span>}
                      </p>
                      <p className="text-xs text-ink-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <Badge tone="brand">admin</Badge>
                      ) : (
                        <select
                          value={user.role ?? "buyer"}
                          disabled={busy}
                          aria-label={`Role for ${user.email}`}
                          onChange={(e) => update.mutate({ id: user._id, patch: { role: e.target.value } })}
                          className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-900"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.status === "blocked" ? "red" : "brand"}>{user.status ?? "active"}</Badge>
                      {user.isVerifiedSeller && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-brand-700 dark:text-brand-300">
                          <BadgeCheck className="size-3.5" aria-hidden /> verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {!isSelf && (user.role === "seller" || user.role === "admin") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={verify.isPending && verify.variables?.id === user._id}
                            onClick={() => verify.mutate({ id: user._id, verified: !user.isVerifiedSeller })}
                          >
                            <BadgeCheck className="size-3.5" aria-hidden />
                            {user.isVerifiedSeller ? "Unverify" : "Verify"}
                          </Button>
                        )}
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={busy}
                            onClick={() =>
                              update.mutate({
                                id: user._id,
                                patch: { status: user.status === "blocked" ? "active" : "blocked" },
                              })
                            }
                          >
                            {user.status === "blocked" ? (
                              <>
                                <ShieldCheck className="size-3.5" aria-hidden /> Unblock
                              </>
                            ) : (
                              <>
                                <ShieldBan className="size-3.5" aria-hidden /> Block
                              </>
                            )}
                          </Button>
                        )}
                        {!isSelf &&
                          (deleting === user._id ? (
                            <>
                              <Button
                                size="sm"
                                variant="danger"
                                loading={remove.isPending}
                                onClick={() => remove.mutate(user._id)}
                              >
                                Confirm delete
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`Delete ${user.email}`}
                              onClick={() => setDeleting(user._id)}
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </Button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminUsers />
    </RequireAuth>
  );
}