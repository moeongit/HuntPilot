import Link from "next/link";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { computeFollowUpDueAt, followUpDueLabel } from "@/lib/followup-rules";

export default async function DashboardPage() {
  const { userId, session } = await requireUser();

  const [apps, activity] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: [{ dateApplied: "desc" }, { createdAt: "desc" }],
      select: { id: true, company: true, role: true, status: true, priority: true, dateApplied: true, lastContacted: true },
      take: 25,
    }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      include: { application: { select: { id: true, company: true, role: true } } },
      take: 10,
    }),
  ]);

  const total = apps.length;
  const interviewCount = apps.filter((a) => a.status === "INTERVIEW").length;
  const offerCount = apps.filter((a) => a.status === "OFFER").length;

  const followUpRows = apps
    .map((app) => {
      const base = app.lastContacted ?? app.dateApplied;
      const dueAt = computeFollowUpDueAt({ status: app.status, baseDate: base });
      if (!dueAt) return null;
      const due = followUpDueLabel(dueAt);
      return { app, dueAt, due, base };
    })
    .filter(Boolean) as Array<{
    app: (typeof apps)[number];
    dueAt: Date;
    due: ReturnType<typeof followUpDueLabel>;
    base: Date;
  }>;

  const overdueCount = followUpRows.filter((r) => r.due.kind === "overdue").length;
  followUpRows.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title="Dashboard"
          subtitle={`Welcome back, ${session.user.name ?? session.user.email ?? "there"}.`}
          right={
            <Link
              href="/app/applications/new"
              className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Add application
            </Link>
          }
        />
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Total</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{total}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">In interview</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{interviewCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Offers</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{offerCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">Follow-ups overdue</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{overdueCount}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent applications" subtitle="Latest applications added to your pipeline." right={<Link href="/app/applications" className="text-sm font-semibold text-slate-700 hover:text-slate-900">View all</Link>} />
          <CardContent>
            {apps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <div className="text-sm font-semibold text-slate-900">Start your pipeline</div>
                <div className="mt-1 text-sm text-slate-600">Add an application to unlock follow-ups, timeline, and analytics.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {apps.slice(0, 6).map((a) => (
                  <Link
                    key={a.id}
                    href={`/app/applications/${a.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {a.company} · {a.role}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Applied {format(a.dateApplied, "PPP")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral">{a.status}</Badge>
                        <Badge variant="neutral">{a.priority}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Follow-ups due" subtitle="Prioritized by due date." right={<Link href="/app/follow-ups" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Open</Link>} />
          <CardContent>
            {followUpRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                No follow-ups due right now.
              </div>
            ) : (
              <div className="space-y-3">
                {followUpRows.slice(0, 6).map((r) => (
                  <Link
                    key={r.app.id}
                    href={`/app/applications/${r.app.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {r.app.company} · {r.app.role}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Last touchpoint {format(r.base, "PPP")}</div>
                      </div>
                      <Badge variant={r.due.kind === "overdue" ? "danger" : r.due.kind === "due" ? "warning" : "neutral"}>
                        {r.due.text}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent activity" subtitle="What changed across your pipeline." right={<Link href="/app/timeline" className="text-sm font-semibold text-slate-700 hover:text-slate-900">View timeline</Link>} />
        <CardContent>
          {activity.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
              No recent activity. Adding applications and completing follow-ups will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((a) => (
                <Link
                  key={a.id}
                  href={`/app/applications/${a.applicationId}`}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{a.title}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {a.application.company} · {a.application.role} • {format(a.occurredAt, "PPP")}
                      </div>
                    </div>
                    <Badge variant="neutral">{a.type}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

