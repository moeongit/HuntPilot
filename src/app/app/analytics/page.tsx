import { differenceInCalendarDays, format, startOfWeek, subWeeks } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/app/analytics-charts";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default async function AnalyticsPage() {
  const { userId } = await requireUser();

  const [apps, activity] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true, dateApplied: true },
      take: 5000,
    }),
    prisma.activity.findMany({
      where: { userId },
      select: { occurredAt: true },
      take: 5000,
    }),
  ]);

  const total = apps.length;
  const responded = apps.filter((a) => a.status !== "APPLIED").length;
  const responseRate = total === 0 ? 0 : responded / total;

  const statusOrder = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"] as const;
  const statusCounts = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<(typeof statusOrder)[number], number>;
  for (const a of apps) statusCounts[a.status as (typeof statusOrder)[number]] += 1;

  const statusData = statusOrder.map((s) => ({ status: s, count: statusCounts[s] }));

  const weeks = Array.from({ length: 12 }).map((_, i) => {
    const d = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 11 - i);
    return startOfWeek(d, { weekStartsOn: 1 });
  });
  const weeklyCounts = new Map<number, number>();
  for (const w of weeks) weeklyCounts.set(w.getTime(), 0);

  for (const a of apps) {
    const wk = startOfWeek(a.dateApplied, { weekStartsOn: 1 }).getTime();
    if (weeklyCounts.has(wk)) weeklyCounts.set(wk, (weeklyCounts.get(wk) ?? 0) + 1);
  }

  const weeklyData = Array.from(weeklyCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([t, count]) => ({ week: format(new Date(t), "MMM d"), count }));

  const touchDates = [
    ...apps.map((a) => a.dateApplied),
    ...activity.map((a) => a.occurredAt),
  ];
  const lastTouch = touchDates.length ? new Date(Math.max(...touchDates.map((d) => d.getTime()))) : null;
  const daysSince = lastTouch ? differenceInCalendarDays(new Date(), lastTouch) : null;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader title="Analytics" subtitle="A quick look at your pipeline performance." />
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Total applications</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{total}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Response rate</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-2xl font-semibold text-slate-900">{pct(responseRate)}</div>
              <Badge variant="neutral">
                {responded} / {total || 0}
              </Badge>
            </div>
            <div className="mt-2 text-sm text-slate-600">Any status beyond Applied counts as a response.</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Days since last activity</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{daysSince ?? "—"}</div>
            <div className="mt-2 text-sm text-slate-600">Based on last application date or timeline activity.</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Pipeline charts"
          subtitle="Applications by status (left) and applications per week (right)."
        />
        <CardContent>
          {total === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="text-sm font-semibold text-slate-900">No data yet</div>
              <div className="mt-1 text-sm text-slate-600">
                Add some applications to see trends and status breakdowns here.
              </div>
            </div>
          ) : (
            <AnalyticsCharts statusData={statusData} weeklyData={weeklyData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

