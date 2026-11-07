import Link from "next/link";
import { Recycle } from "lucide-react";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/products", label: "Browse all" },
      { href: "/categories", label: "Categories" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Recycle className="size-4" aria-hidden />
            </span>
            ReSell Hub
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            A marketplace for things that still have life left in them.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-500 hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-ink-200 py-5 text-center text-xs text-ink-400 dark:border-ink-800">
        © {new Date().getFullYear()} ReSell Hub
      </div>
    </footer>
  );
}