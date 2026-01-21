import Link from "next/link";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function InterviewsPage() {
  const { userId } = await requireUser();

  const rounds = await prisma.interviewRound.findMany({
    where: { userId, outcome: "PENDING" },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    include: {
      application: { select: { id: true, company: true, role: true, status: true } },
      checklist: { select: { id: true, isDone: true } },
    },
    take: 80,
  });

  const upcoming = rounds.filter((r) => r.scheduledAt !== null);
  const unscheduled = rounds.filter((r) => r.scheduledAt === null);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title="Interview Prep"
          subtitle="Track upcoming rounds, notes, and checklist progress."
          right={
            <Link href="/app/applications">
              <Button variant="secondary" size="sm">
                View applications
              </Button>
            </Link>
          }
        />
        <CardContent>
          {rounds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="text-sm font-semibold text-slate-900">No upcoming interview rounds</div>
              <div className="mt-1 text-sm text-slate-600">
                Add interview rounds inside an application to track preparation and progress.
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-500">Scheduled</div>
                <div className="mt-3 space-y-3">
                  {upcoming.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                      No scheduled rounds.
                    </div>
                  ) : (
                    upcoming.map((r) => {
                      const total = r.checklist.length;
                      const done = r.checklist.filter((c) => c.isDone).length;
                      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                      return (
                        <Link
                          key={r.id}
                          href={`/app/applications/${r.applicationId}`}
                          className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {r.application.company} · {r.application.role}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Round {r.roundNumber} · {r.scheduledAt ? format(r.scheduledAt, "PPP") : "Unscheduled"}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                Prep progress: <span className="font-semibold text-slate-700">{pct}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral">{r.application.status}</Badge>
                            </div>
                          </div>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-2 rounded-full bg-slate-900" style={{ width: `${pct}%` }} />
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500">Unscheduled</div>
                <div className="mt-3 space-y-3">
                  {unscheduled.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                      No unscheduled rounds.
                    </div>
                  ) : (
                    unscheduled.map((r) => (
                      <Link
                        key={r.id}
                        href={`/app/applications/${r.applicationId}`}
                        className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                      >
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {r.application.company} · {r.application.role}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Round {r.roundNumber} · Unscheduled</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

