"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  Flag,
  Heart,
  UserRound,
  LayoutDashboard,
  Package,
  PackagePlus,
  Receipt,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// links are added here as each dashboard page ships, so nothing 404s
const items = {
  buyer: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "My orders", icon: ClipboardList },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/payments", label: "Payments", icon: Receipt },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  seller: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/seller/add-product", label: "Add product", icon: PackagePlus },
    { href: "/dashboard/seller/my-products", label: "My products", icon: Package },
    { href: "/dashboard/seller/manage-orders", label: "Manage orders", icon: Truck },
    { href: "/dashboard/seller/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/orders", label: "My purchases", icon: ClipboardList },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/products", label: "Manage products", icon: ShieldCheck },
    { href: "/dashboard/admin/users", label: "Manage users", icon: Users },
    { href: "/dashboard/admin/orders", label: "All orders", icon: ClipboardList },
    { href: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/admin/reports", label: "Reports", icon: Flag },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/seller/my-products", label: "My listings", icon: Package },
    { href: "/dashboard/profile", label: "Profile", icon: UserRound },
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
            aria-current={active ? "page" : undefined}
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