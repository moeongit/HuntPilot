 "use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { z } from "zod";

const templateSchema = z.object({
  status: z.union([z.literal(""), z.enum(["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"])]).transform((v) => (v === "" ? null : v)),
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Message body is required").max(4000),
});

export type TemplateFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createTemplateAction(_prev: TemplateFormState, formData: FormData): Promise<TemplateFormState> {
  const { userId } = await requireUser();

  const raw = {
    status: formData.get("status"),
    title: formData.get("title"),
    body: formData.get("body"),
  };

  const parsed = templateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.followUpTemplate.create({
    data: {
      userId,
      status: parsed.data.status,
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  revalidatePath("/app/settings");
  revalidatePath("/app/follow-ups");
  return { ok: true, message: "Template saved." };
}

export async function deleteTemplateAction(formData: FormData) {
  const { userId } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.followUpTemplate.deleteMany({ where: { id, userId } });
  revalidatePath("/app/settings");
}

