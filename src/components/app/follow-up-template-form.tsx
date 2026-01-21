"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createTemplateAction, type TemplateFormState } from "@/app/app/settings/actions";

const statuses = [
  { value: "", label: "Any status" },
  { value: "APPLIED", label: "Applied" },
  { value: "OA", label: "OA" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
] as const;

const initial: TemplateFormState = { ok: false };

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

export function FollowUpTemplateForm() {
  const [state, action, pending] = useActionState(createTemplateAction, initial);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="grid gap-4">
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

      <Field label="Status" error={errors.status?.[0]}>
        <select name="status" className={inputClass(Boolean(errors.status?.length))}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title" error={errors.title?.[0]}>
        <input name="title" className={inputClass(Boolean(errors.title?.length))} placeholder="Quick follow-up" />
      </Field>

      <Field label="Message" error={errors.body?.[0]}>
        <textarea
          name="body"
          rows={6}
          className={cn(
            "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-offset-2",
            errors.body?.length ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-slate-200",
          )}
          placeholder="Hi {name}, just checking in on my application for..."
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save template"}
        </Button>
      </div>
    </form>
  );
}

