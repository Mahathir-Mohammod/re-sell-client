"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const trust = [
  { icon: ShieldCheck, title: "Buyer protection", copy: "Payments held until you confirm delivery." },
  { icon: Truck, title: "Local pickup or delivery", copy: "Arrange what suits both sides." },
  { icon: Leaf, title: "Less waste", copy: "Every purchase keeps an item in use." },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-brand-50 to-white dark:border-ink-800 dark:from-ink-900 dark:to-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }}>
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-600/20 dark:bg-ink-800 dark:text-brand-200"
          >
            <Leaf className="size-3.5" aria-hidden /> Second-hand, first choice
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Good things deserve <span className="text-brand-600">a second owner</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-lg text-ink-600 dark:text-ink-300">
            Buy and sell electronics, furniture, vehicles and more — with people nearby,
            at prices that make sense for both sides.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Browse products <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center rounded-xl border border-ink-200 bg-white px-6 font-semibold text-ink-800 transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-transparent dark:text-ink-100 dark:hover:bg-ink-800"
            >
              Start selling
            </Link>
          </motion.div>
        </motion.div>

        <motion.ul
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
        >
          {trust.map(({ icon: Icon, title, copy }) => (
            <motion.li
              key={title}
              variants={fadeUp}
              className="rounded-2xl border border-ink-200 bg-white/80 p-5 backdrop-blur dark:border-ink-800 dark:bg-ink-900/70"
            >
              <Icon className="size-5 text-brand-600" aria-hidden />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-ink-500">{copy}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}