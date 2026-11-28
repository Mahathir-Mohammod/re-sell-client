import Link from "next/link";
import { HeartHandshake, Leaf, ShieldCheck, Users } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Why ReSell Hub exists: affordable second-hand goods with less waste.",
};

const values = [
  {
    icon: Leaf,
    title: "Keep things in use",
    copy: "The greenest product is the one already made. Reselling skips manufacturing entirely.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    copy: "Role-based accounts, verified sellers and a report button on every listing.",
  },
  {
    icon: Users,
    title: "Built for real people",
    copy: "Buyers, sellers and admins each get tools shaped around what they actually do.",
  },
  {
    icon: HeartHandshake,
    title: "Fair prices both ways",
    copy: "Sellers keep more, buyers pay less, and nobody pays for a middleman warehouse.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">About us</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">A marketplace for things worth keeping</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-600 dark:text-ink-300">
        ReSell Hub is a second-hand marketplace for electronics, furniture, vehicles, fashion, phones,
        home goods, sports gear and books. The idea is simple: buying used should be as easy and as
        trustworthy as buying new — and a lot cheaper.
      </p>
      <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-300">
        Sellers list an item in a couple of minutes. Buyers browse with real filters, pay securely by
        card, and can cancel before dispatch. Admins review new listings, keep an eye on reports and
        can verify sellers who have earned it.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {values.map(({ icon: Icon, title, copy }) => (
          <li key={title} className="rounded-2xl border border-ink-200 p-5 dark:border-ink-800">
            <Icon className="size-5 text-brand-600" aria-hidden />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-ink-500">{copy}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50/60 p-6 dark:border-brand-900 dark:bg-brand-900/20">
        <h2 className="font-semibold">Start somewhere</h2>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Browse what is listed today, or put your first item up for sale.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/products" className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
            Browse products
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-ink-300 px-4 py-2 hover:bg-white dark:border-ink-700 dark:hover:bg-ink-800"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
