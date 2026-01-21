import { addDays, differenceInCalendarDays } from "date-fns";

export type FollowUpRuleStatus = "APPLIED" | "OA" | "INTERVIEW" | "OFFER" | "REJECTED";

export function followUpCadenceDays(status: FollowUpRuleStatus) {
  switch (status) {
    case "OA":
      return 3;
    case "INTERVIEW":
      return 2;
    case "OFFER":
      return 1;
    case "REJECTED":
      return null;
    case "APPLIED":
    default:
      return 7;
  }
}

export function computeFollowUpDueAt({
  status,
  baseDate,
}: {
  status: FollowUpRuleStatus;
  baseDate: Date;
}) {
  const cadence = followUpCadenceDays(status);
  if (cadence === null) return null;
  return addDays(baseDate, cadence);
}

export function followUpDueLabel(dueAt: Date, now = new Date()) {
  const diff = differenceInCalendarDays(dueAt, now);
  if (diff === 0) return { kind: "due", text: "Due today" as const };
  if (diff > 0) return { kind: "upcoming", text: `Due in ${diff} day${diff === 1 ? "" : "s"}` as const };
  const overdue = Math.abs(diff);
  return { kind: "overdue", text: `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}` as const };
}

