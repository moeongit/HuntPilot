"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

const activitySchema = z.object({
  applicationId: z.string().min(1),
  type: z.enum(["APPLIED", "CONTACTED", "OA", "INTERVIEW", "OFFER", "REJECTED", "FOLLOW_UP", "NOTE"]),
  occurredAt: z.coerce.date(),
  title: z.string().trim().min(1, "Title is required").max(200),
});

export type ActivityFormState = { ok: boolean; message?: string; errors?: Record<string, string[]> };

export async function logActivityAction(_prev: ActivityFormState, formData: FormData): Promise<ActivityFormState> {
  const { userId } = await requireUser();

  const raw = {
    applicationId: formData.get("applicationId"),
    type: formData.get("type"),
    occurredAt: formData.get("occurredAt"),
    title: formData.get("title"),
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { applicationId, type, occurredAt, title } = parsed.data;

  const app = await prisma.jobApplication.findFirst({
    where: { id: applicationId, userId },
    select: { id: true },
  });
  if (!app) return { ok: false, message: "Application not found." };

  const nextStatus =
    type === "OA" ? "OA" : type === "INTERVIEW" ? "INTERVIEW" : type === "OFFER" ? "OFFER" : type === "REJECTED" ? "REJECTED" : null;

  const shouldTouch = type === "CONTACTED" || type === "FOLLOW_UP" || type === "INTERVIEW" || type === "OA";

  await prisma.$transaction([
    prisma.activity.create({
      data: { userId, applicationId, type, title, occurredAt },
    }),
    prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(shouldTouch ? { lastContacted: occurredAt } : {}),
      },
    }),
  ]);

  revalidatePath("/app/timeline");
  revalidatePath(`/app/applications/${applicationId}`);
  revalidatePath("/app/applications");
  redirect(`/app/applications/${applicationId}`);
}

