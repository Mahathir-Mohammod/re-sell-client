"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Boxes, HeartHandshake, Leaf, ShoppingBag, Star, Users } from "lucide-react";

// Counts up once the block scrolls into view. Respects prefers-reduced-motion by
// rendering the final value with no animation at all (no setState-in-effect).
function CountUp({ to, suffix = "", duration = 1200 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      // ease-out so the number settles rather than stopping dead
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration, reduced]);

  // reduced motion (or before the animation starts) shows the real number
  const shown = reduced ? to : value;

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

const cards = [
  { key: "products", label: "Items for sale", icon: ShoppingBag },
  { key: "sellers", label: "Active sellers", icon: Users },
  { key: "completedOrders", label: "Orders completed", icon: Boxes },
  { key: "averageRating", label: "Average rating", icon: Star, decimals: 1, suffix: "/5" },
];

export function MarketplaceStats({ stats }) {
  if (!stats) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">By the numbers</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">A marketplace that keeps growing</h2>
      </div>

      <motion.ul
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.08 }}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {cards.map(({ key, label, icon: Icon, suffix }) => (
          <li
            key={key}
            className="rounded-2xl border border-ink-200 p-5 text-center dark:border-ink-800"
          >
            <Icon className="mx-auto size-5 text-brand-600" aria-hidden />
            <p className="mt-3 text-3xl font-bold tracking-tight">
              <CountUp to={Number(stats[key] ?? 0)} suffix={suffix ?? ""} />
            </p>
            <p className="mt-1 text-sm text-ink-500">{label}</p>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}

const stories = [
  {
    quote: "I furnished my whole flat for less than one new sofa. Everything arrived exactly as described.",
    name: "Priya S.",
    role: "Buyer in Brooklyn",
    icon: ShoppingBag,
  },
  {
    quote: "Sold four pieces of gear in a week. The dashboard made the order flow obvious.",
    name: "Daniel M.",
    role: "Seller in Austin",
    icon: Users,
  },
  {
    quote: "Buying second-hand used to feel risky. The reviews and verified sellers fixed that.",
    name: "Amara K.",
    role: "Buyer in Chicago",
    icon: HeartHandshake,
  },
];

export function SuccessStories() {
  return (
    <section className="border-y border-ink-200 bg-ink-50/60 py-14 dark:border-ink-800 dark:bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Success stories</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">People already trading nearby</h2>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {stories.map(({ quote, name, role, icon: Icon }, index) => (
            <motion.li
              key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08 }}
              className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-ink-200 dark:bg-ink-900 dark:ring-ink-800"
            >
              <Icon className="size-5 text-brand-600" aria-hidden />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">“{quote}”</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-ink-500">{role}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Sustainability({ stats }) {
  // Rough, clearly-labelled estimates — the copy says "estimated" so nothing overclaims.
  const items = Number(stats?.completedOrders ?? 0) + Number(stats?.products ?? 0);
  const wasteSaved = items * 2.5;
  const co2Saved = items * 6;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-2xl border border-brand-200 bg-brand-50/60 p-6 sm:p-10 lg:grid-cols-2 lg:items-center dark:border-brand-900 dark:bg-brand-900/20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-600/20 dark:bg-ink-900 dark:text-brand-200">
            <Leaf className="size-3.5" aria-hidden /> Sustainability
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Every resale keeps something out of landfill</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            Manufacturing a new item takes energy and raw materials. Passing one on skips all of it,
            which is why second-hand is the cheapest form of recycling there is.
          </p>
          <p className="mt-3 text-xs text-ink-500">
            Estimates based on the listings and completed orders on this marketplace, assuming ~2.5 kg
            of avoided waste and ~6 kg CO₂e saved per item.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-5 dark:bg-ink-900">
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Estimated waste avoided</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">
              <CountUp to={Math.round(wasteSaved)} /> <span className="text-base font-medium text-ink-500">kg</span>
            </dd>
          </div>
          <div className="rounded-2xl bg-white p-5 dark:bg-ink-900">
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Estimated CO₂e saved</dt>
            <dd className="mt-1 text-3xl font-bold tracking-tight">
              <CountUp to={Math.round(co2Saved)} /> <span className="text-base font-medium text-ink-500">kg</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}