import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteTemplateAction } from "@/app/app/settings/actions";
import { FollowUpTemplateForm } from "@/components/app/follow-up-template-form";

export default async function SettingsPage() {
  const { userId } = await requireUser();

  const templates = await prisma.followUpTemplate.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader title="Settings" subtitle="Manage follow-up message templates by status." />
        <CardContent>
          <FollowUpTemplateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Saved templates" subtitle="Use templates as a starting point when writing follow-ups." />
        <CardContent>
          {templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="text-sm font-semibold text-slate-900">No templates yet</div>
              <div className="mt-1 text-sm text-slate-600">Create a template to reuse for follow-ups.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                        <Badge variant="neutral">{t.status ?? "ANY"}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">Updated {format(t.updatedAt, "PPP")}</div>
                      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{t.body}</div>
                    </div>
                    <form action={deleteTemplateAction}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button variant="secondary" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

