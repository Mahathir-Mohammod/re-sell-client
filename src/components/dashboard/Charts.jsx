"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

// Shared chart chrome so every dashboard graph looks like one system.
const axis = { stroke: "currentColor", fontSize: 11, tickLine: false, axisLine: false };
const grid = { stroke: "currentColor", strokeOpacity: 0.12, vertical: false };
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(100,116,139,0.25)",
  background: "rgba(255,255,255,0.96)",
  fontSize: 12,
  color: "#0f172a",
};

const SERIES_COLORS = ["#0f9d76", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

const monthLabel = (month) => {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short" });
};

export function ChartFrame({ title, description, children, height = 260 }) {
  return (
    <section className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
      <header className="mb-3">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
      </header>
      <div className="text-ink-400" style={{ height }}>
        {children}
      </div>
    </section>
  );
}

export function RevenueAreaChart({ data, title, description }) {
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f9d76" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0f9d76" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...grid} />
          <XAxis dataKey="month" tickFormatter={monthLabel} {...axis} />
          <YAxis width={70} tickFormatter={(v) => formatPrice(v)} {...axis} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [formatPrice(value), "Revenue"]}
            labelFormatter={monthLabel}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0f9d76"
            strokeWidth={2}
            fill="url(#revenueFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function OrdersBarChart({ data, title, description, dataKey = "orders", label = "Orders" }) {
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="month" tickFormatter={monthLabel} {...axis} />
          <YAxis width={36} allowDecimals={false} {...axis} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={monthLabel} />
          <Bar dataKey={dataKey} name={label} fill="#3b82f6" radius={[6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CategoryBarChart({ data, title, description }) {
  return (
    <ChartFrame title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid {...grid} horizontal={false} vertical />
          <XAxis type="number" allowDecimals={false} {...axis} />
          <YAxis type="category" dataKey="category" width={110} {...axis} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" name="Listings" radius={[0, 6, 6, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function StatusLegendChart({ data, title, description }) {
  return (
    <ChartFrame title={title} description={description} height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid {...grid} />
          <XAxis dataKey="status" {...axis} />
          <YAxis width={36} allowDecimals={false} {...axis} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}