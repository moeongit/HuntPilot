"use client";

import * as React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createJobApplicationAction, type JobApplicationFormState } from "@/app/app/applications/actions";
import { applicationStatusValues, priorityValues } from "@/lib/validation/job-application";

const initialState: JobApplicationFormState = { ok: false };

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

export function JobApplicationForm() {
  const [state, action, isPending] = useActionState(createJobApplicationAction, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="grid gap-6">
      {state.message ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-semibold",
            state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company" error={errors.company?.[0]}>
          <input name="company" className={inputClass(Boolean(errors.company?.length))} placeholder="Acme" />
        </Field>
        <Field label="Role" error={errors.role?.[0]}>
          <input name="role" className={inputClass(Boolean(errors.role?.length))} placeholder="Software Engineer" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Location" error={errors.location?.[0]}>
          <input name="location" className={inputClass(Boolean(errors.location?.length))} placeholder="Remote / NYC" />
        </Field>
        <Field label="Application link" error={errors.applicationLink?.[0]}>
          <input
            name="applicationLink"
            className={inputClass(Boolean(errors.applicationLink?.length))}
            placeholder="https://jobs.example.com/..."
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Status" error={errors.status?.[0]}>
          <select name="status" className={inputClass(Boolean(errors.status?.length))}>
            {applicationStatusValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority" error={errors.priority?.[0]}>
          <select name="priority" className={inputClass(Boolean(errors.priority?.length))}>
            {priorityValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source" error={errors.source?.[0]}>
          <input
            name="source"
            className={inputClass(Boolean(errors.source?.length))}
            placeholder="LinkedIn / Referral / Company site"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Date applied" error={errors.dateApplied?.[0]}>
          <input name="dateApplied" type="date" className={inputClass(Boolean(errors.dateApplied?.length))} />
        </Field>
        <Field label="Last contacted" error={errors.lastContacted?.[0]}>
          <input name="lastContacted" type="date" className={inputClass(Boolean(errors.lastContacted?.length))} />
        </Field>
        <Field label="Salary range (optional)" error={errors.salaryRange?.[0]}>
          <input name="salaryRange" className={inputClass(Boolean(errors.salaryRange?.length))} placeholder="$120k–$160k" />
        </Field>
      </div>

      <Field label="Tags (comma-separated)" error={errors.tags?.[0]}>
        <input name="tags" className={inputClass(Boolean(errors.tags?.length))} placeholder="backend, referral, fast-track" />
        <div className="text-xs text-slate-500">Tags are private to your account and reused across applications.</div>
      </Field>

      <Field label="Notes (optional)" error={errors.notes?.[0]}>
        <textarea
          name="notes"
          rows={5}
          className={cn(
            "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-offset-2",
            errors.notes?.length ? "border-rose-300 focus:ring-rose-200" : "border-slate-200 focus:ring-slate-200",
          )}
          placeholder="Anything you'd like to remember: recruiter name, referral context, questions, etc."
        />
      </Field>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create application"}
        </Button>
      </div>
    </form>
  );
}

