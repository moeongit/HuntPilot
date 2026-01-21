import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobApplicationEditForm } from "@/components/app/job-application-edit-form";
import { deleteJobApplicationAction } from "@/app/app/applications/[id]/edit/actions";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;

  const app = await prisma.jobApplication.findFirst({
    where: { id, userId },
    include: { tags: { include: { tag: true } } },
  });
  if (!app) notFound();

  const tags = app.tags.map((t) => t.tag.name).join(", ");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title="Edit application"
          subtitle={`${app.company} · ${app.role}`}
          right={
            <div className="flex items-center gap-2">
              <Link href={`/app/applications/${app.id}`}>
                <Button variant="secondary" size="sm">
                  Back
                </Button>
              </Link>
              <form action={deleteJobApplicationAction}>
                <input type="hidden" name="id" value={app.id} />
                <Button variant="danger" size="sm" type="submit">
                  Delete
                </Button>
              </form>
            </div>
          }
        />
        <CardContent>
          <JobApplicationEditForm
            application={{
              id: app.id,
              company: app.company,
              role: app.role,
              location: app.location,
              applicationLink: app.applicationLink,
              status: app.status,
              priority: app.priority,
              salaryRange: app.salaryRange,
              source: app.source,
              dateApplied: format(app.dateApplied, "yyyy-MM-dd"),
              lastContacted: app.lastContacted ? format(app.lastContacted, "yyyy-MM-dd") : "",
              notes: app.notes,
              tags,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

