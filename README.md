# HuntPilot

**HuntPilot** is a production-quality portfolio project: a modern **Job Application Pipeline Dashboard** that helps you track applications, manage follow-ups, prepare for interviews, and analyze your pipeline.

## Architecture (high level)

- **Next.js App Router**: server components for pages + route handlers for auth.
- **Auth**: **NextAuth (GitHub OAuth)** at `src/app/api/auth/[...nextauth]/route.ts`, with a Prisma adapter.
- **DB**: **PostgreSQL + Prisma**. Prisma Client is generated into `src/generated/prisma`.
- **Route protection**: `middleware.ts` protects **all** `/app/*` routes.
- **Mutations**: **Server Actions** with **Zod** validation (e.g. create/edit applications, templates, follow-ups).
- **UI**: Tailwind v4, dashboard shell (sidebar + top bar), polished empty states + skeleton loaders.
- **Charts**: Recharts (see `/app/analytics`).

## Features implemented

- **GitHub OAuth login** + user-scoped data access
- **Job applications (CRUD)**: company, role, location, link, status, priority, salary range, dates, notes, tags, source
- **Timeline**: activity feed across applications + per-application activity stream
- **Manual activity logging**: `/app/applications/[id]/log` (updates status + last-contacted when relevant)
- **Follow-up intelligence (rule-based)**: due/overdue indicators + “mark completed” workflow
- **Follow-up templates**: saved templates by status in `/app/settings`
- **Interview prep**: per-application checklists + interview rounds (create rounds, round checklists, progress indicator)
- **Analytics**: status breakdown, weekly volume, response rate, days since last activity
- **Seed script** with realistic demo pipeline data

## Local setup (Windows-friendly)

### 1) Install dependencies

```bash
npm install
```

### 2) Start Postgres (Docker)

```bash
docker compose up -d
```

### 3) Create `.env`

This repo includes `ENV.example`. Copy it to `.env` and fill in values:

- **DATABASE_URL**: `postgresql://postgres:postgres@localhost:5432/huntpilot?schema=public`
- **NEXTAUTH_URL**: `http://localhost:3000`
- **NEXTAUTH_SECRET**: generate one (example):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- **GITHUB_ID / GITHUB_SECRET**:
  - Create a GitHub OAuth App in GitHub Developer Settings
  - **Homepage URL**: `http://localhost:3000`
  - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### 4) Migrate + seed

```bash
npm run db:migrate
```

Optional: seed realistic demo data. For best results, seed using the same email as your GitHub account:

```bash
# PowerShell
$env:SEED_USER_EMAIL="you@yourdomain.com"
npm run db:seed
```

### 5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Deployment notes / walkthrough:

- `TODO: add link`

