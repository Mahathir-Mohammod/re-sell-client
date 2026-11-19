"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";

const roleLabel = { buyer: "Buyer", seller: "Seller", admin: "Admin" };

export default function DashboardLayout({ children }) {
  const { user, role } = useAuth();

  return (
    <RequireAuth>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {user?.name?.slice(0, 1).toUpperCase() ?? "?"}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.name}</p>
              <Badge tone="brand">{roleLabel[role] ?? "Buyer"}</Badge>
            </div>
          </div>

          <DashboardSidebar role={role} />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </RequireAuth>
  );
}