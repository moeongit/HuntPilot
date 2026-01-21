"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusDatum = { status: string; count: number };
type WeeklyDatum = { week: string; count: number };

export function AnalyticsCharts({
  statusData,
  weeklyData,
}: {
  statusData: StatusDatum[];
  weeklyData: WeeklyDatum[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Bar dataKey="count" fill="#0f172a" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              cursor={{ stroke: "#94a3b8" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

