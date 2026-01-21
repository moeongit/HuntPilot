"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { jobApplicationFormSchema, parseTags } from "@/lib/validation/job-application";

export type EditJobApplicationState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateJobApplicationAction(
  _prev: EditJobApplicationState,
  formData: FormData,
): Promise<EditJobApplicationState> {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing application id." };

  const raw = {
    company: formData.get("company"),
    role: formData.get("role"),
    location: formData.get("location"),
    applicationLink: formData.get("applicationLink"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    salaryRange: formData.get("salaryRange"),
    source: formData.get("source"),
    dateApplied: formData.get("dateApplied"),
    lastContacted: formData.get("lastContacted"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  };

  const parsed = jobApplicationFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const app = await prisma.jobApplication.findFirst({ where: { id, userId }, select: { id: true } });
  if (!app) return { ok: false, message: "Application not found." };

  const input = parsed.data;
  const tags = parseTags(input.tags);

  await prisma.jobApplication.update({
    where: { id },
    data: {
      company: input.company,
      role: input.role,
      location: input.location,
      applicationLink: input.applicationLink,
      status: input.status,
      priority: input.priority,
      salaryRange: input.salaryRange,
      source: input.source,
      dateApplied: input.dateApplied,
      lastContacted: input.lastContacted,
      notes: input.notes,
    },
  });

  await prisma.applicationTag.deleteMany({ where: { applicationId: id } });
  if (tags.length > 0) {
    const tagRows = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where: { userId_name: { userId, name } },
          update: {},
          create: { userId, name },
          select: { id: true },
        }),
      ),
    );
    await prisma.applicationTag.createMany({
      data: tagRows.map((t) => ({ applicationId: id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/app/applications");
  revalidatePath(`/app/applications/${id}`);
  redirect(`/app/applications/${id}`);
}

export async function deleteJobApplicationAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.jobApplication.deleteMany({ where: { id, userId } });
  revalidatePath("/app/applications");
  revalidatePath("/app/timeline");
  revalidatePath("/app/follow-ups");
  revalidatePath("/app/interviews");
  redirect("/app/applications");
}

