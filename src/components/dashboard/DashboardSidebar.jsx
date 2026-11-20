"use client";

import Link from "next/link";
import {
  ClipboardList,
  LayoutDashboard,
  PackagePlus,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

// links are added here as each dashboard page ships, so nothing 404s
const items = {
  buyer: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "My orders", icon: ClipboardList },
    { href: "/dashboard/payments", label: "Payments", icon: Receipt },
  ],
  seller: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/seller/add-product", label: "Add product", icon: PackagePlus },
    { href: "/dashboard/seller/my-products", label: "My products", icon: ClipboardList },
    { href: "/dashboard/orders", label: "My orders", icon: Receipt },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/seller/my-products", label: "My products", icon: ClipboardList },
  ],
};

export function DashboardSidebar({ role = "buyer" }) {
  const pathname = usePathname();
  const links = items[role] ?? items.buyer;

  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium",
              active
                ? "bg-brand-600 text-white"
                : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}