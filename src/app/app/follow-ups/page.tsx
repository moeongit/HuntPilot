import Link from "next/link";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { computeFollowUpDueAt, followUpDueLabel } from "@/lib/followup-rules";
import { completeFollowUpAction } from "@/app/app/follow-ups/actions";

export default async function FollowUpsPage() {
  const { userId } = await requireUser();

  const apps = await prisma.jobApplication.findMany({
    where: { userId, status: { in: ["APPLIED", "OA", "INTERVIEW", "OFFER"] } },
    select: {
      id: true,
      company: true,
      role: true,
      status: true,
      lastContacted: true,
      dateApplied: true,
    },
    orderBy: [{ lastContacted: "asc" }, { dateApplied: "asc" }],
    take: 200,
  });

  const rows = apps
    .map((app) => {
      const base = app.lastContacted ?? app.dateApplied;
      const dueAt = computeFollowUpDueAt({ status: app.status, baseDate: base });
      if (!dueAt) return null;
      const due = followUpDueLabel(dueAt);
      return { app, base, dueAt, due };
    })
    .filter(Boolean) as Array<{
    app: (typeof apps)[number];
    base: Date;
    dueAt: Date;
    due: ReturnType<typeof followUpDueLabel>;
  }>;

  rows.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

  return (
    <Card>
      <CardHeader
        title="Follow-ups"
        subtitle="Rule-based follow-up due indicators (no AI). Mark completed to update last-contacted and timeline."
        right={
          <Link href="/app/settings">
            <Button variant="secondary" size="sm">
              Templates
            </Button>
          </Link>
        }
      />
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <div className="text-sm font-semibold text-slate-900">No follow-ups due</div>
            <div className="mt-1 text-sm text-slate-600">
              Once you add applications and log activity, follow-ups will appear here based on status cadence.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(({ app, base, dueAt, due }) => (
              <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/app/applications/${app.id}`} className="block">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {app.company} · {app.role}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <Badge variant="neutral">{app.status}</Badge>
                        <span className="text-slate-300">•</span>
                        <span>Last touchpoint: {format(base, "PPP")}</span>
                        <span className="text-slate-300">•</span>
                        <span>Due: {format(dueAt, "PPP")}</span>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={due.kind === "overdue" ? "danger" : due.kind === "due" ? "warning" : "neutral"}>
                      {due.text}
                    </Badge>
                    <form action={completeFollowUpAction}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <Button variant="secondary" size="sm" type="submit">
                        Mark completed
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

