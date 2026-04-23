# Project Separation Plan

## Proposed Architecture

Three deployable projects in one repo, plus the existing `landing/`:

```
signal-works-lms/
├── landing/          ← public website (already exists, needs cleanup)
├── assessment/       ← new: assessment app
├── lms/              ← new: student/instructor/admin app
└── (root)            ← kept as reference; nothing new runs from here
```

All three share the **same Neon Postgres database** and **same Clerk instance** — no data duplication, no sync logic. Inter-service calls use REST with a shared internal secret header.

---

## Phase 1 — Clean up `landing/`

**Changes:**
- Remove the **Sign In** button and `NEXT_PUBLIC_APP_URL` from the landing `NavBar.tsx`
- Remove `APP_URL` constant from `page.tsx`
- Replace the two CTA buttons (`/assessment/intake`) with a `NEXT_PUBLIC_ASSESSMENT_URL` env var so they can point at the deployed assessment app
- Remove `.env.example` `NEXT_PUBLIC_APP_URL` entry; add `NEXT_PUBLIC_ASSESSMENT_URL`

**Result:** Fully public, zero auth surface, zero dependency on any other app.

---

## Phase 2 — Create `assessment/`

**What moves here:**

| Source | Destination |
|--------|-------------|
| `src/app/assessment/` | `assessment/src/app/` |
| `src/app/api/assessment/` | `assessment/src/app/api/assessment/` |
| `src/modules/assessment/` | `assessment/src/modules/assessment/` |
| `src/server/assessment/` | `assessment/src/server/assessment/` |
| `src/app/sign-in/`, `src/app/sign-up/` | `assessment/src/app/` |

**What gets copied (shared utilities, not moved):**
- `src/lib/prisma.ts`, `src/lib/types.ts`, `src/lib/logger.ts`, `src/lib/auth.ts`
- `src/lib/i18n/`, `src/lib/theme/`
- `src/modules/common/` (NavBar, ThemeToggle)
- `src/server/knowledge/` (used by assessment AI)
- `prisma/schema.prisma`

**New in this app:**
- `GET /api/internal/results/:userId` — exposes assessment results to LMS, protected by `INTERNAL_API_SECRET` header
- `middleware.ts` protecting `/assessment/*` routes; sign-in/sign-up public

**Dependencies:** `next`, `react`, `@clerk/nextjs`, `@prisma/client`, `@anthropic-ai/sdk`, voyage AI client, `zod`

**Env vars:**
```
DATABASE_URL
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ANTHROPIC_API_KEY
EMBEDDINGS_API_KEY
EMBEDDINGS_API_URL
EMBEDDINGS_MODEL
JDOODLE_CLIENT_ID
JDOODLE_CLIENT_SECRET
INTERNAL_API_SECRET
NEXT_PUBLIC_LMS_URL        ← redirect target after assessment completion
```

---

## Phase 3 — Create `lms/`

**What moves here:**

| Source | Destination |
|--------|-------------|
| `src/app/student/` | `lms/src/app/student/` |
| `src/app/instructor/` | `lms/src/app/instructor/` |
| `src/app/admin/` | `lms/src/app/admin/` |
| `src/app/dashboard/` | `lms/src/app/dashboard/` |
| `src/app/roadmap/` | `lms/src/app/roadmap/` |
| `src/app/api/lms/` | `lms/src/app/api/lms/` |
| `src/app/api/admin/` | `lms/src/app/api/admin/` |
| `src/app/api/student/` | `lms/src/app/api/student/` |
| `src/app/api/messages/` | `lms/src/app/api/messages/` |
| `src/app/api/activity/` | `lms/src/app/api/activity/` |
| `src/app/api/github/` | `lms/src/app/api/github/` |
| `src/app/api/calendar/` | `lms/src/app/api/calendar/` |
| `src/app/api/roadmap/` | `lms/src/app/api/roadmap/` |
| `src/app/api/knowledge/` | `lms/src/app/api/knowledge/` |
| `src/app/api/reviews/` | `lms/src/app/api/reviews/` |
| `src/app/api/webhooks/` | `lms/src/app/api/webhooks/` |
| `src/app/api/cron/` | `lms/src/app/api/cron/` |
| `src/app/api/auth/` | `lms/src/app/api/auth/` |
| `src/app/api/users/` | `lms/src/app/api/users/` |
| `src/app/api/ai/` | `lms/src/app/api/ai/` |
| `src/modules/student/` | `lms/src/modules/student/` |
| `src/modules/instructor/` | `lms/src/modules/instructor/` |
| `src/modules/lms/` | `lms/src/modules/lms/` |
| `src/modules/messaging/` | `lms/src/modules/messaging/` |
| `src/server/lms/` | `lms/src/server/lms/` |
| `src/server/activity/` | `lms/src/server/activity/` |
| `src/server/messaging/` | `lms/src/server/messaging/` |
| `src/server/github/` | `lms/src/server/github/` |
| `src/server/google-calendar/` | `lms/src/server/google-calendar/` |
| `src/server/auth/` | `lms/src/server/auth/` |

**What gets copied:**
- Same shared utilities as assessment (prisma, types, logger, i18n, theme, common NavBar)

**Assessment data in LMS — REST approach:**

The two places LMS needs assessment data:
1. **Admin student pages** (`/admin/[username]/assessments`) — currently query DB directly; will call `assessment/api/internal/results/:userId`
2. **Student skills/roadmap pages** — same, call assessment API

A thin `src/lib/assessmentClient.ts` (already exists) will be pointed at `ASSESSMENT_API_URL`. No other changes needed to the consuming components.

**Dependencies:** Full set — `@clerk/nextjs`, `@prisma/client`, `@anthropic-ai/sdk`, `googleapis`, `@octokit/rest`, `bcryptjs`, `date-fns`, `zod`, `axios`, etc.

**Env vars:**
```
DATABASE_URL
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ANTHROPIC_API_KEY
EMBEDDINGS_API_KEY
EMBEDDINGS_API_URL
GITHUB_PERSONAL_ACCESS_TOKEN
GITHUB_WEBHOOK_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DOCS_DOCUMENT_ID
GOOGLE_REDIRECT_URI
ENCRYPTION_SECRET
CRON_SECRET
IP_HASH_SALT
VERCEL_WEBHOOK_SECRET
NEXT_PUBLIC_ASSESSMENT_URL   ← assessment app URL (public, for links)
ASSESSMENT_API_URL           ← internal server-side base URL for REST calls
INTERNAL_API_SECRET          ← shared secret for internal API auth
```

---

## Phase 4 — REST Contract Between Apps

**Assessment exposes to LMS:**
```
GET /api/internal/results/:userId     → skill profile, scores, history
GET /api/internal/sessions/:userId    → all session summaries
```

**LMS exposes to Assessment:**
```
GET /api/internal/curriculum/:userId  → recommended next steps post-assessment
```

All internal routes check: `Authorization: Bearer INTERNAL_API_SECRET`

---

## What Does NOT Change

- The **root project** is left alone. It still builds and deploys as-is. No files are deleted from root — this is a copy-out approach, not a destructive move. The root can be retired from Vercel once the two new apps are verified.
- **Prisma schema** is copied into both `assessment/` and `lms/` but the actual database is shared. Both apps run `prisma generate` against the same schema; neither runs migrations (migrations stay at root).
- **Clerk** — same publishable key and secret in all three apps.

---

## Deployment on Vercel

| Project | Root Directory | Key Env Vars |
|---------|---------------|-------------|
| `signal-works-landing` | `landing` | `NEXT_PUBLIC_ASSESSMENT_URL` |
| `signal-works-assessment` | `assessment` | DB, Clerk, AI, `INTERNAL_API_SECRET`, `NEXT_PUBLIC_LMS_URL` |
| `signal-works-lms` | `lms` | DB, Clerk, all integrations, `ASSESSMENT_API_URL`, `INTERNAL_API_SECRET` |

---

## Execution Order

1. **Phase 1** — Clean up `landing/` (small, safe, no dependencies)
2. **Phase 2** — Scaffold `assessment/` and verify it builds independently
3. **Phase 3** — Scaffold `lms/` and verify it builds independently
4. **Phase 4** — Wire up internal REST endpoints and update `assessmentClient.ts` in `lms/`
5. **Verification** — Test all three apps locally before any Vercel deployment
6. **Deploy** — Create two new Vercel projects pointing at `assessment/` and `lms/` subdirectories
