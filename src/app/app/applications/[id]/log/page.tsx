import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLogForm } from "@/components/app/activity-log-form";

export default async function LogActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;

  const app = await prisma.jobApplication.findFirst({
    where: { id, userId },
    select: { id: true, company: true, role: true },
  });
  if (!app) notFound();

  return (
    <Card>
      <CardHeader
        title="Log activity"
        subtitle={`${app.company} · ${app.role}`}
        right={
          <Link href={`/app/applications/${app.id}`}>
            <Button variant="secondary" size="sm">
              Back
            </Button>
          </Link>
        }
      />
      <CardContent>
        <ActivityLogForm applicationId={app.id} />
      </CardContent>
    </Card>
  );
}

