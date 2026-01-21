import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { computeFollowUpDueAt, followUpDueLabel } from "@/lib/followup-rules";
import { addChecklistItemAction, addInterviewRoundAction, toggleChecklistItemAction } from "@/app/app/applications/prep-actions";

function statusVariant(status: string) {
  switch (status) {
    case "OFFER":
      return "success";
    case "INTERVIEW":
    case "OA":
      return "warning";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser();
  const { id } = await params;

  const app = await prisma.jobApplication.findFirst({
    where: { id, userId },
    include: {
      tags: { include: { tag: true } },
      activities: { orderBy: { occurredAt: "desc" }, take: 25 },
      followUps: { orderBy: { dueAt: "desc" }, take: 10 },
      interviewRounds: { orderBy: { roundNumber: "asc" }, include: { checklist: true } },
      checklist: { where: { roundId: null }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!app) notFound();

  const base = app.lastContacted ?? app.dateApplied;
  const dueAt = computeFollowUpDueAt({ status: app.status, baseDate: base });
  const due = dueAt ? followUpDueLabel(dueAt) : null;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader
          title={
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold text-slate-900">
                {app.company} · {app.role}
              </div>
              <Badge variant={statusVariant(app.status)}>{app.status}</Badge>
              <Badge variant="neutral">{app.priority}</Badge>
            </div>
          }
          subtitle={
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600">{app.location}</span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-600">Applied {format(app.dateApplied, "PPP")}</span>
              {app.lastContacted ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-600">Last contacted {format(app.lastContacted, "PPP")}</span>
                </>
              ) : null}
            </div>
          }
          right={
            <div className="flex items-center gap-2">
              <Link href={`/app/applications/${app.id}/log`}>
                <Button variant="secondary" size="sm">
                  Log activity
                </Button>
              </Link>
              <Link href={`/app/applications/${app.id}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </Link>
              <a
                href={app.applicationLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                Open link
              </a>
              <Link href="/app/applications">
                <Button variant="secondary" size="sm">
                  Back
                </Button>
              </Link>
            </div>
          }
        />
        <CardContent className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Follow-up</div>
              {dueAt && due ? (
                <div className="mt-2">
                  <Badge variant={due.kind === "overdue" ? "danger" : due.kind === "due" ? "warning" : "neutral"}>
                    {due.text}
                  </Badge>
                  <div className="mt-2 text-sm text-slate-600">
                    Based on status cadence and last touchpoint ({format(base, "PPP")}).
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-600">No follow-ups needed for this status.</div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Source</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">{app.source}</div>
              {app.salaryRange ? <div className="mt-1 text-sm text-slate-600">{app.salaryRange}</div> : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Tags</div>
              {app.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {app.tags.map((t) => (
                    <Badge key={t.tagId} variant="neutral" className="bg-white">
                      {t.tag.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-600">No tags</div>
              )}
            </div>
          </div>

          {app.notes ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">Notes</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{app.notes}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Timeline"
            subtitle="Key activity events for this application."
            right={
              <Link href="/app/timeline">
                <Button variant="secondary" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <CardContent>
            {app.activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                No activity yet.
              </div>
            ) : (
              <div className="space-y-3">
                {app.activities.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500">{format(a.occurredAt, "PPP")}</div>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{a.type}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Interview prep" subtitle="Rounds, notes, and checklists." />
          <CardContent className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-slate-500">General checklist</div>
              {app.checklist.length === 0 ? (
                <div className="mt-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                  No checklist items yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {app.checklist.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <div className="text-sm text-slate-800">{c.text}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.isDone ? "success" : "neutral"}>{c.isDone ? "Done" : "Open"}</Badge>
                        <form action={toggleChecklistItemAction}>
                          <input type="hidden" name="applicationId" value={app.id} />
                          <input type="hidden" name="itemId" value={c.id} />
                          <Button variant="secondary" size="sm" type="submit">
                            {c.isDone ? "Mark open" : "Mark done"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form action={addChecklistItemAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="applicationId" value={app.id} />
                <input
                  name="text"
                  placeholder="Add a checklist item…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                />
                <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                  Add
                </Button>
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-slate-500">Rounds</div>
              </div>
              {app.interviewRounds.length === 0 ? (
                <div className="mt-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-600">
                  No interview rounds logged.
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  {app.interviewRounds.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">Round {r.roundNumber}</div>
                        <Badge variant={r.outcome === "PASSED" ? "success" : r.outcome === "FAILED" ? "danger" : "neutral"}>
                          {r.outcome}
                        </Badge>
                      </div>
                      {r.scheduledAt ? <div className="mt-1 text-sm text-slate-600">Scheduled {format(r.scheduledAt, "PPP")}</div> : null}
                      {r.notes ? <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{r.notes}</div> : null}
                      <div className="mt-3 space-y-2">
                        {r.checklist.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                            No checklist items for this round.
                          </div>
                        ) : (
                          r.checklist.map((c) => (
                            <div
                              key={c.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
                            >
                              <div className="text-sm text-slate-800">{c.text}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant={c.isDone ? "success" : "neutral"}>{c.isDone ? "Done" : "Open"}</Badge>
                                <form action={toggleChecklistItemAction}>
                                  <input type="hidden" name="applicationId" value={app.id} />
                                  <input type="hidden" name="itemId" value={c.id} />
                                  <Button variant="secondary" size="sm" type="submit">
                                    {c.isDone ? "Mark open" : "Mark done"}
                                  </Button>
                                </form>
                              </div>
                            </div>
                          ))
                        )}

                        <form action={addChecklistItemAction} className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <input type="hidden" name="applicationId" value={app.id} />
                          <input type="hidden" name="roundId" value={r.id} />
                          <input
                            name="text"
                            placeholder="Add round checklist item…"
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                          />
                          <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                            Add
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form action={addInterviewRoundAction} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <input type="hidden" name="applicationId" value={app.id} />
                <div className="text-sm font-semibold text-slate-900">Add round</div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-semibold text-slate-900">Round number (optional)</label>
                    <input
                      name="roundNumber"
                      type="number"
                      min={1}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                      placeholder="Auto"
                    />
                  </div>
                  <div className="grid gap-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-900">Scheduled date (optional)</label>
                    <input
                      name="scheduledAt"
                      type="date"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-semibold text-slate-900">Notes (optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                    placeholder="Round format, topics to review, links, etc."
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" size="sm">
                    Add round
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

