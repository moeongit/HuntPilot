import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function statusVariant(status: string) {
  switch (status) {
    case "OFFER":
      return "success";
    case "INTERVIEW":
    case "OA":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export default async function ApplicationsPage() {
  const { userId } = await requireUser();

  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: [{ dateApplied: "desc" }, { createdAt: "desc" }],
    include: {
      tags: { include: { tag: true } },
    },
    take: 100,
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title="Applications"
          subtitle="Track your job applications with status, priority, tags, and follow-ups."
          right={
            <Link href="/app/applications/new">
              <Button size="sm">Add application</Button>
            </Link>
          }
        />
        <CardContent>
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="text-sm font-semibold text-slate-900">No applications yet</div>
              <div className="mt-1 text-sm text-slate-600">
                Add your first application to start tracking statuses, follow-ups, and interview prep.
              </div>
              <div className="mt-5 flex justify-center">
                <Link href="/app/applications/new">
                  <Button>Add your first application</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                <div className="col-span-4">Company / Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Applied</div>
                <div className="col-span-2">Tags</div>
              </div>
              <div className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/app/applications/${app.id}`}
                    className="grid grid-cols-12 gap-3 px-4 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900">{app.company}</div>
                      <div className="mt-0.5 text-sm text-slate-600">{app.role}</div>
                      <div className="mt-1 text-xs text-slate-500">{app.location}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={statusVariant(app.status)}>{app.status}</Badge>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="neutral">{app.priority}</Badge>
                    </div>
                    <div className="col-span-2 text-sm text-slate-700">
                      {app.dateApplied.toLocaleDateString()}
                    </div>
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1.5">
                        {app.tags.slice(0, 3).map((t) => (
                          <Badge key={t.tagId} className="bg-white" variant="neutral">
                            {t.tag.name}
                          </Badge>
                        ))}
                        {app.tags.length > 3 ? (
                          <span className="text-xs font-semibold text-slate-500">+{app.tags.length - 3}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

