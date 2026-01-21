"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { jobApplicationFormSchema, parseTags } from "@/lib/validation/job-application";

export type JobApplicationFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createJobApplicationAction(
  _prevState: JobApplicationFormState,
  formData: FormData,
): Promise<JobApplicationFormState> {
  const { userId } = await requireUser();

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

  const input = parsed.data;
  const tags = parseTags(input.tags);

  const created = await prisma.jobApplication.create({
    data: {
      userId,
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
      activities: {
        create: {
          userId,
          type: "APPLIED",
          title: `Applied to ${input.company} · ${input.role}`,
          occurredAt: input.dateApplied,
        },
      },
    },
    select: { id: true },
  });

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
      data: tagRows.map((t) => ({ applicationId: created.id, tagId: t.id })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/app/applications");
  redirect(`/app/applications/${created.id}`);
}

