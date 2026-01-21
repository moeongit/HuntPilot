import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "demo@huntpilot.local";
  const name = process.env.SEED_USER_NAME ?? "Demo User";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name },
    select: { id: true, email: true },
  });

  const templateData = [
    {
      status: "APPLIED" as const,
      title: "Applied follow-up (7 days)",
      body:
        "Hi {name},\n\nI applied for the {role} position last week and wanted to follow up to see if there’s any additional information I can provide.\n\nThanks,\n{your_name}",
    },
    {
      status: "INTERVIEW" as const,
      title: "Post-interview thank you",
      body:
        "Hi {name},\n\nThank you for your time today — I enjoyed learning more about the team and the role. I’m excited about the opportunity and would love to help.\n\nBest,\n{your_name}",
    },
    {
      status: null,
      title: "Referral intro nudge",
      body:
        "Hi {name},\n\nHope you’re doing well. I wanted to follow up on the referral intro — happy to share any additional context or a short blurb you can forward.\n\nThanks,\n{your_name}",
    },
  ];

  await prisma.followUpTemplate.deleteMany({ where: { userId: user.id } });
  await prisma.followUpTemplate.createMany({
    data: templateData.map((t) => ({ ...t, userId: user.id })),
  });

  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.followUp.deleteMany({ where: { userId: user.id } });
  await prisma.checklistItem.deleteMany({ where: { userId: user.id } });
  await prisma.interviewRound.deleteMany({ where: { userId: user.id } });
  await prisma.applicationTag.deleteMany({});
  await prisma.jobApplication.deleteMany({ where: { userId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });

  const companies = [
    "Acme",
    "BluePeak",
    "Nimbus",
    "ExampleCorp",
    "Delta Systems",
    "Orbit",
    "Copper",
    "Pinecone",
    "Quanta",
    "Sunset Labs",
    "Northwind",
    "Greenfield",
    "Aurora",
    "Vertex",
    "Zenith",
    "Atlas",
    "Horizon",
    "Keystone",
  ] as const;

  const roles = [
    "Software Engineer",
    "Full-Stack Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Platform Engineer",
    "Data Engineer",
  ] as const;

  const sources = ["LinkedIn", "Referral", "Company site", "Recruiter outreach"] as const;
  const locations = ["Remote", "NYC", "SF Bay Area", "Austin", "Seattle"] as const;
  const tagPool = ["referral", "fast-track", "remote", "backend", "frontend", "platform", "startup", "enterprise"] as const;

  const statuses = ["APPLIED", "OA", "INTERVIEW", "OFFER", "REJECTED"] as const;
  const priorities = ["LOW", "MEDIUM", "HIGH"] as const;

  const apps = await Promise.all(
    companies.map(async (company, i) => {
      const status = pick(statuses);
      const priority = pick(priorities);
      const dateApplied = subDays(new Date(), 3 + i * 2);
      const baseLastContacted =
        status === "APPLIED" ? null : addDays(dateApplied, Math.min(10, 2 + (i % 6)));

      const created = await prisma.jobApplication.create({
        data: {
          userId: user.id,
          company,
          role: pick(roles),
          location: pick(locations),
          applicationLink: `https://example.com/jobs/${company.toLowerCase()}`,
          status,
          priority,
          salaryRange: i % 3 === 0 ? "$120k–$160k" : null,
          source: pick(sources),
          dateApplied,
          lastContacted: baseLastContacted,
          notes:
            i % 4 === 0
              ? "Focus areas:\n- System design\n- Async patterns\n- Observability\n\nAsk:\n- Team scope\n- On-call rotation"
              : null,
        },
        select: { id: true, company: true, role: true, status: true, dateApplied: true, lastContacted: true },
      });

      const tags = unique([pick(tagPool), pick(tagPool), pick(tagPool)]).slice(0, 3);
      const tagRows = await Promise.all(
        tags.map((name) =>
          prisma.tag.upsert({
            where: { userId_name: { userId: user.id, name } },
            update: {},
            create: { userId: user.id, name },
            select: { id: true },
          }),
        ),
      );
      await prisma.applicationTag.createMany({
        data: tagRows.map((t) => ({ applicationId: created.id, tagId: t.id })),
        skipDuplicates: true,
      });

      await prisma.activity.create({
        data: {
          userId: user.id,
          applicationId: created.id,
          type: "APPLIED",
          title: `Applied to ${created.company} · ${created.role}`,
          occurredAt: created.dateApplied,
        },
      });

      if (created.lastContacted) {
        await prisma.activity.create({
          data: {
            userId: user.id,
            applicationId: created.id,
            type: "CONTACTED",
            title: `Contacted / check-in · ${created.company}`,
            occurredAt: created.lastContacted,
          },
        });
      }

      if (created.status === "INTERVIEW") {
        const round1 = await prisma.interviewRound.create({
          data: {
            userId: user.id,
            applicationId: created.id,
            roundNumber: 1,
            scheduledAt: addDays(created.dateApplied, 7),
            notes: "Round 1: recruiter screen.\nPrep: STAR stories + role alignment.",
          },
          select: { id: true },
        });
        await prisma.checklistItem.createMany({
          data: [
            { userId: user.id, applicationId: created.id, roundId: null, text: "Review job description highlights", isDone: true },
            { userId: user.id, applicationId: created.id, roundId: round1.id, text: "Prepare intro + recent project deep dive", isDone: false },
            { userId: user.id, applicationId: created.id, roundId: round1.id, text: "Write 5 questions to ask interviewer", isDone: true },
          ],
        });
      } else {
        await prisma.checklistItem.createMany({
          data: [
            { userId: user.id, applicationId: created.id, roundId: null, text: "Collect role-specific talking points", isDone: i % 2 === 0 },
            { userId: user.id, applicationId: created.id, roundId: null, text: "Update resume bullets for this role", isDone: i % 3 === 0 },
          ],
        });
      }

      if (created.status !== "REJECTED" && (i % 3 === 0 || i % 4 === 0)) {
        const dueAt = addDays(created.lastContacted ?? created.dateApplied, 7);
        const completedAt = addDays(dueAt, -2);
        await prisma.followUp.create({
          data: { userId: user.id, applicationId: created.id, dueAt, completedAt },
        });
      }

      return created;
    }),
  );

  console.log(`Seeded ${apps.length} applications for ${user.email}.`);
  if (!process.env.SEED_USER_EMAIL) {
    console.log(
      "Tip: set SEED_USER_EMAIL to your GitHub account email before seeding so your first OAuth sign-in links to the seeded user.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

