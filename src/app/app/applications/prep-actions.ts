"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

const addChecklistSchema = z.object({
  applicationId: z.string().min(1),
  roundId: z.string().optional(),
  text: z.string().trim().min(1, "Text is required").max(200),
});

export async function addChecklistItemAction(formData: FormData) {
  const { userId } = await requireUser();

  const parsed = addChecklistSchema.safeParse({
    applicationId: formData.get("applicationId"),
    roundId: formData.get("roundId") ? String(formData.get("roundId")) : undefined,
    text: formData.get("text"),
  });
  if (!parsed.success) return;

  const { applicationId, roundId, text } = parsed.data;

  const app = await prisma.jobApplication.findFirst({ where: { id: applicationId, userId }, select: { id: true } });
  if (!app) return;

  if (roundId) {
    const round = await prisma.interviewRound.findFirst({ where: { id: roundId, applicationId, userId }, select: { id: true } });
    if (!round) return;
  }

  await prisma.checklistItem.create({
    data: { userId, applicationId, roundId: roundId ?? null, text },
  });

  revalidatePath(`/app/applications/${applicationId}`);
  redirect(`/app/applications/${applicationId}`);
}

const toggleChecklistSchema = z.object({
  itemId: z.string().min(1),
  applicationId: z.string().min(1),
});

export async function toggleChecklistItemAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = toggleChecklistSchema.safeParse({
    itemId: formData.get("itemId"),
    applicationId: formData.get("applicationId"),
  });
  if (!parsed.success) return;

  const { itemId, applicationId } = parsed.data;

  const item = await prisma.checklistItem.findFirst({ where: { id: itemId, userId, applicationId }, select: { isDone: true } });
  if (!item) return;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { isDone: !item.isDone },
  });

  revalidatePath(`/app/applications/${applicationId}`);
  redirect(`/app/applications/${applicationId}`);
}

const addRoundSchema = z.object({
  applicationId: z.string().min(1),
  roundNumber: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(20)])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  scheduledAt: z.union([z.literal(""), z.coerce.date()]).transform((v) => (v === "" ? null : v)).optional(),
  notes: z.string().optional(),
});

export async function addInterviewRoundAction(formData: FormData) {
  const { userId } = await requireUser();

  const parsed = addRoundSchema.safeParse({
    applicationId: formData.get("applicationId"),
    roundNumber: formData.get("roundNumber"),
    scheduledAt: formData.get("scheduledAt"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return;

  const { applicationId, scheduledAt, notes } = parsed.data;

  const app = await prisma.jobApplication.findFirst({ where: { id: applicationId, userId }, select: { id: true } });
  if (!app) return;

  const nextNumber =
    parsed.data.roundNumber ??
    ((await prisma.interviewRound.count({ where: { applicationId, userId } })) + 1);

  await prisma.interviewRound.create({
    data: {
      userId,
      applicationId,
      roundNumber: nextNumber,
      scheduledAt,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });

  revalidatePath(`/app/applications/${applicationId}`);
  revalidatePath("/app/interviews");
  redirect(`/app/applications/${applicationId}`);
}

