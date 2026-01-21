import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { HuntPilotLogo } from "@/components/branding/huntpilot-logo";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) redirect("/app");

  const sp = (await searchParams) ?? {};
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const githubConfigured = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {(error || !githubConfigured) && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <div className="font-semibold">{!githubConfigured ? "Sign-in isn’t configured yet" : "GitHub sign-in failed"}</div>
            <div className="mt-1 text-rose-800">
              {!githubConfigured ? (
                <>
                  Missing <code className="font-mono">GITHUB_ID</code> /{" "}
                  <code className="font-mono">GITHUB_SECRET</code> in your <code className="font-mono">.env</code>.
                  After setting them, restart <code className="font-mono">npm run dev</code>.
                </>
              ) : (
                <>
                  GitHub sign-in returned an error (<code className="font-mono">{error}</code>). Double-check your GitHub
                  OAuth App callback URL is{" "}
                  <code className="font-mono">http://localhost:3000/api/auth/callback/github</code> and that your{" "}
                  <code className="font-mono">GITHUB_ID</code>/<code className="font-mono">GITHUB_SECRET</code> match.
                </>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <HuntPilotLogo subtitle="Job Application Pipeline Dashboard" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignInButton
              disabled={!githubConfigured}
              className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Track applications, follow-ups, and interviews — like a real pipeline.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              HuntPilot is a polished dashboard for managing your job search: statuses, activity timeline,
              follow-up rules, interview prep checklists, and pipeline analytics — all scoped to your account.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SignInButton
                disabled={!githubConfigured}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                children="Get started"
              />
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold">Follow-up intelligence</div>
                <div className="mt-1 text-sm text-slate-600">
                  Rule-based due indicators by status, plus reusable templates.
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold">Analytics</div>
                <div className="mt-1 text-sm text-slate-600">
                  Streaks, response rate, weekly volume, and status breakdowns.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <div className="grid gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Pipeline snapshot</div>
                  <div className="text-xs text-slate-500">Example</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Applied", value: 18 },
                    { label: "Interview", value: 4 },
                    { label: "Offer", value: 1 },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border border-slate-200 p-3">
                      <div className="text-xs text-slate-500">{kpi.label}</div>
                      <div className="mt-1 text-lg font-semibold">{kpi.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-semibold">Today</div>
                <div className="mt-3 space-y-2">
                  {[
                    "Follow up with Acme (7 days since contact)",
                    "Prep: System design round @ ExampleCorp",
                    "Log: OA completed for Beta Inc",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                      <div className="h-2 w-2 rounded-full bg-slate-900" />
                      <div className="text-sm text-slate-700">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-slate-200 pt-8 text-xs text-slate-500">
          Built with Next.js, Prisma, Postgres, NextAuth (GitHub OAuth), Tailwind, and Recharts.
        </div>
      </div>
    </div>
  );
}
