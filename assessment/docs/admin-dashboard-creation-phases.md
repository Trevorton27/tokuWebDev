# Admin Dashboard Creation — Implementation Phases

## Overview

Build an admin-only dashboard that surfaces student assessment roadmaps, persists them in the database, and links to them from internal notification emails.

---

## ✅ Phase 1 — Database Schema (Complete)

Add `AssessmentRoadmap` model to Prisma schema and apply migration.

**Changes:**
- Added `AssessmentRoadmap` model to `prisma/schema.prisma` with fields:
  - `id`, `userId`, `sessionId` (unique), `generatedAt`
  - `level`, `score`, `summary`, `totalDuration`, `firstStep`
  - `phases` (Json), `projects` (Json)
- Added `roadmap AssessmentRoadmap?` relation to `AssessmentSession`
- Added `assessmentRoadmaps AssessmentRoadmap[]` relation to `User`
- Applied schema via `prisma db push`

---

## ✅ Phase 2 — Roadmap Generation Update (Complete)

Extend `roadmapService.ts` and `roadmapPdf.ts` to include 5 curated projects per student.

**Changes:**
- Added `RoadmapProject` interface to `roadmapService.ts`:
  ```ts
  { title, description, skills, difficulty, isCapstone }
  ```
- Added `projects: RoadmapProject[]` to `GeneratedRoadmap`
- Updated Claude prompt to generate exactly 5 projects:
  - Projects 1–4: progressively complex, interest-aligned
  - Project 5: comprehensive AI-powered capstone
- Added "Projects to Build" section to PDF output in `roadmapPdf.ts`
  - Capstone rendered with purple header to distinguish it visually

---

## ✅ Phase 3 — Persist Roadmap to Database (Complete)

Save the generated roadmap to `AssessmentRoadmap` in the finalize route so it can be retrieved later.

**Changes:**
- In `src/app/api/assessment/intake/finalize/route.ts`, after `generateRoadmap()` succeeds:
  - `prisma.assessmentRoadmap.upsert` using `sessionId` as unique key
  - Stores `level`, `score`, `summary`, `totalDuration`, `firstStep`, `phases` (Json), `projects` (Json)
  - Upsert ensures re-submitting doesn't create duplicates — it overwrites with fresh data
- Returns `roadmapId` in the API response for use in email link generation (Phase 6)

---

## ✅ Phase 4 — Admin Role & Route Protection (Complete)

Restrict `/admin/*` routes to users with `publicMetadata.role === 'ADMIN'` in Clerk.

**Changes:**
- Added `requireAdmin()` convenience function to `src/lib/auth.ts` — wraps `requireRole(['ADMIN'])`, throws `Forbidden` if not admin
- Updated `src/middleware.ts` to protect `/admin(.*)` and `/api/admin(.*)`:
  - Calls `auth.protect()` first (redirects unauthenticated users to sign-in)
  - Reads `auth.sessionClaims?.metadata?.role` from Clerk JWT claims
  - Redirects non-admins to `/sign-in?error=forbidden`

**To grant admin access:** In the Clerk Dashboard, open a user → Metadata → Public metadata → set `{ "role": "ADMIN" }`

---

## ✅ Phase 5 — Admin Dashboard UI (Complete)

Build the admin-facing pages to browse and inspect student roadmaps.

**Pages created:**
- `src/app/admin/layout.tsx` — shared layout with nav bar; calls `requireAdmin()` to gate all admin pages
- `src/app/admin/page.tsx` — student list table: name, email, level badge, score, duration, submission date, link to roadmap
- `src/app/admin/roadmaps/[id]/page.tsx` — full roadmap detail:
  - Dark header card: student name/email, level badge, score, duration, generated date
  - Summary paragraph
  - First Step callout (indigo banner)
  - Learning phases: focus, goals, resources, phase project per phase
  - Projects section: difficulty badge, skills chips, capstone highlighted in indigo

**Data fetching:** Server Components with `prisma.assessmentRoadmap.findMany/findUnique` joined to `User`

---

## ✅ Phase 6 — Roadmap Link in Internal Email (Complete)

Include a direct link to the admin roadmap view in the support email sent on submission.

**Changes:**
- Added `roadmapId?: string` to `AssessmentEmailPayload` in `emailService.ts`
- URL constructed as `${NEXT_PUBLIC_APP_URL}/admin/roadmaps/${roadmapId}` (falls back to `localhost:3003` if unset)
- HTML email: "View Full Roadmap in Dashboard →" indigo button added in the Student Information section
- Plain-text email: `Dashboard: <url>` line added under student info
- `finalize/route.ts` passes `roadmapId` (from Phase 3 DB upsert) into `sendAssessmentEmails`

**Env var required:** `NEXT_PUBLIC_APP_URL=https://your-domain.com` (set in `.env` / Vercel dashboard)

---

## Dependency Order

```
Phase 1 (DB schema) → Phase 2 (generation) → Phase 3 (persist) → Phase 6 (email link)
                                                                → Phase 4 (auth) → Phase 5 (UI)
```
