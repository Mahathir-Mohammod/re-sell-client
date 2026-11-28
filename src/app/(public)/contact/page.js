import { Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "How to reach the ReSell Hub team.",
};

const channels = [
  {
    icon: Mail,
    title: "Email",
    copy: "hello@resellhub.example",
    detail: "Best for account issues, payment questions and data requests.",
  },
  {
    icon: MessageCircle,
    title: "Report a listing",
    copy: "Use the report button",
    detail: "Every product page has one. Reports go straight to the admin queue.",
  },
  {
    icon: MapPin,
    title: "Where we are",
    copy: "Remote-first",
    detail: "Listings are local, so your pickup happens wherever the seller is.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Contact</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Get in touch</h1>
      <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
        Questions about an order, a listing or your account? Here is where to go.
      </p>

      <ul className="mt-8 space-y-3">
        {channels.map(({ icon: Icon, title, copy, detail }) => (
          <li
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-ink-700 dark:text-ink-200">{copy}</p>
              <p className="mt-0.5 text-xs text-ink-500">{detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-ink-400">
        Order-specific problems are fastest to solve with the order id from your buyer dashboard.
      </p>
    </div>
  );
}
