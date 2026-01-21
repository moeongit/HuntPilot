"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { computeFollowUpDueAt } from "@/lib/followup-rules";

export async function completeFollowUpAction(formData: FormData) {
  const { userId } = await requireUser();
  const applicationId = String(formData.get("applicationId") ?? "");

  if (!applicationId) return;

  const app = await prisma.jobApplication.findFirst({
    where: { id: applicationId, userId },
    select: { id: true, company: true, role: true, status: true, lastContacted: true, dateApplied: true },
  });

  if (!app) return;

  const base = app.lastContacted ?? app.dateApplied;
  const dueAt = computeFollowUpDueAt({ status: app.status, baseDate: base });
  if (!dueAt) return;

  const now = new Date();

  await prisma.$transaction([
    prisma.followUp.create({
      data: {
        userId,
        applicationId: app.id,
        dueAt,
        completedAt: now,
      },
    }),
    prisma.jobApplication.update({
      where: { id: app.id },
      data: { lastContacted: now },
    }),
    prisma.activity.create({
      data: {
        userId,
        applicationId: app.id,
        type: "FOLLOW_UP",
        title: `Follow-up completed · ${app.company} · ${app.role}`,
        occurredAt: now,
      },
    }),
  ]);

  revalidatePath("/app/follow-ups");
  revalidatePath(`/app/applications/${app.id}`);
  revalidatePath("/app/timeline");
}

