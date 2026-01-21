import { z } from "zod";

export const applicationStatusValues = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"] as const;
export const priorityValues = ["LOW", "MEDIUM", "HIGH"] as const;

const emptyToUndefined = z
  .string()
  .transform((v) => (typeof v === "string" && v.trim() === "" ? undefined : v));

export const jobApplicationFormSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  location: z.string().trim().min(1, "Location is required").max(120),
  applicationLink: z.string().trim().url("Enter a valid URL"),
  status: z.enum(applicationStatusValues),
  priority: z.enum(priorityValues),
  salaryRange: emptyToUndefined.optional().pipe(z.string().max(80).optional()),
  source: z.string().trim().min(1, "Source is required").max(80),
  dateApplied: z.coerce.date(),
  lastContacted: z
    .union([z.literal(""), z.coerce.date()])
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  notes: emptyToUndefined.optional().pipe(z.string().max(5000).optional()),
  tags: emptyToUndefined.optional().pipe(z.string().max(200).optional()),
});

export type JobApplicationFormInput = z.infer<typeof jobApplicationFormSchema>;

export function parseTags(tagsRaw: string | undefined) {
  if (!tagsRaw) return [];
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return Array.from(new Set(tags)).slice(0, 12);
}

