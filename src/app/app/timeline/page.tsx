import Link from "next/link";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function TimelinePage() {
  const { userId } = await requireUser();

  const activity = await prisma.activity.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    include: {
      application: { select: { id: true, company: true, role: true, status: true } },
    },
    take: 120,
  });

  return (
    <Card>
      <CardHeader
        title="Timeline"
        subtitle="Recent activity across your applications."
        right={
          <Link href="/app/applications/new">
            <Button size="sm">Add application</Button>
          </Link>
        }
      />
      <CardContent>
        {activity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <div className="text-sm font-semibold text-slate-900">No activity yet</div>
            <div className="mt-1 text-sm text-slate-600">
              Activity appears when you add applications or log interactions like contact, OA, and interview rounds.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((a) => (
              <Link
                key={a.id}
                href={`/app/applications/${a.applicationId}`}
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{a.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {a.application.company} · {a.application.role}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{a.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{a.application.status}</Badge>
                    <div className="text-xs text-slate-500">{format(a.occurredAt, "PPP")}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

