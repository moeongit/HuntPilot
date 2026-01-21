"use client";

import * as React from "react";
import { useActionState } from "react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { logActivityAction, type ActivityFormState } from "@/app/app/applications/[id]/log/actions";

const initial: ActivityFormState = { ok: false };

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-semibold text-slate-900">{label}</label>
      {children}
      {error ? <div className="text-sm font-semibold text-rose-600">{error}</div> : null}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-offset-2",
    hasError
      ? "border-rose-300 focus:ring-rose-200"
      : "border-slate-200 focus:border-slate-300 focus:ring-slate-200",
  );
}

const typeOptions = [
  { value: "CONTACTED", label: "Contacted" },
  { value: "FOLLOW_UP", label: "Follow-up sent" },
  { value: "OA", label: "OA / assessment" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NOTE", label: "Note" },
] as const;

export function ActivityLogForm({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(logActivityAction, initial);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="applicationId" value={applicationId} />

      {state.message ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Type" error={errors.type?.[0]}>
          <select name="type" className={inputClass(Boolean(errors.type?.length))}>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date" error={errors.occurredAt?.[0]}>
          <input name="occurredAt" type="date" className={inputClass(Boolean(errors.occurredAt?.length))} />
        </Field>
      </div>

      <Field label="Title" error={errors.title?.[0]}>
        <input
          name="title"
          className={inputClass(Boolean(errors.title?.length))}
          placeholder="E.g. Followed up with recruiter"
        />
      </Field>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log activity"}
        </Button>
      </div>
    </form>
  );
}

