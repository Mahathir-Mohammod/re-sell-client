"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Recycle, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/products", label: "Browse" },
  { href: "/categories", label: "Categories" },
];

export function Navbar() {
  const { user, role, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/products?search=${encodeURIComponent(q.trim())}` : "/products");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur dark:border-ink-800 dark:bg-ink-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Recycle className="size-5" aria-hidden />
          </span>
          <span className="text-lg">ReSell Hub</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white",
                pathname.startsWith(l.href) && "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
          ) : user ? (
            <>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:text-ink-900 dark:hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}