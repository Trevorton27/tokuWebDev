# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sub-Apps

All source code lives in three standalone Next.js apps, each with its own `package.json`, `node_modules`, and (where applicable) `prisma/`:

| Directory | Purpose |
|---|---|
| `lms/` | Main app — courses, students, GitHub, calendar, messaging, AI roadmap |
| `assessment/` | Standalone intake assessment and challenge runner |
| `landing/` | Marketing/public landing page |

## Commands (run from inside the sub-app directory)

```bash
# Development
npm run dev          # Start dev server (default port 3000)
npm run build        # Production build
npm run lint         # ESLint via next lint

# Database (lms/ only)
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:studio    # Open Prisma Studio GUI
npm run seed:prod        # Seed production data (tsx scripts/seed-production.ts)

# Testing (lms/ only)
npm test             # Run all Jest tests
npm run test:watch   # Watch mode
```

To run a single test file (from `lms/`):
```bash
npx jest src/server/assessment/__tests__/skillModel.test.ts
```

## LMS App Architecture (`lms/src/`)

```
src/
├── app/             # Next.js App Router — pages and API routes
│   ├── (public)/    # Unauthenticated routes (login)
│   ├── admin/       # Admin-only pages
│   ├── instructor/  # Instructor pages
│   ├── student/     # Student pages
│   ├── assessment/  # Assessment UI page
│   └── api/         # All API routes, organized by domain
├── lib/             # Shared utilities
├── modules/         # UI components organized by domain
│   ├── assessment/  # Assessment & challenge UI
│   ├── lms/         # Course/lesson UI
│   ├── student/     # Student dashboard components
│   └── common/      # Shared UI (NavBar, LayoutShell, ThemeToggle)
├── server/          # Server-side business logic
│   ├── assessment/  # Skill model, mastery, AI tutor, challenges
│   ├── lms/         # Course, lesson, enrollment, roadmap services
│   ├── knowledge/   # RAG embedding and search
│   └── activity/    # GitHub events, activity metrics
├── components/      # Cross-domain shared React components
└── styles/          # Global CSS (Tailwind base)
```

## Key Patterns

### Authentication & Authorization

- **Clerk** handles auth. `src/middleware.ts` protects route groups (`/admin`, `/instructor`, `/student`, `/assessment`) at the edge.
- Role-based access is enforced at the route/page level using helpers from `src/lib/auth.ts`:
  - `getCurrentUser()` — returns DB user (with DB `id`, not Clerk ID) or `null`
  - `requireAuth()` — throws if unauthenticated
  - `requireRole(['ADMIN', 'INSTRUCTOR'])` — throws if role not allowed
- **Roles** (`STUDENT`, `INSTRUCTOR`, `ADMIN`) are stored in **Clerk public metadata** and synced to the DB via `src/server/auth/userSyncService.ts` on every request.
- The `user.id` returned by `getCurrentUser()` is always the **database ID** (cuid), not the Clerk user ID.

### API Route Pattern

All API routes follow this structure:
```ts
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['ADMIN']);
    // ... call service from src/server/
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: '...' }, { status: 4xx });
  }
}
```

Services in `src/server/` contain all business logic and call Prisma directly. API routes are thin wrappers.

### Database

- Prisma client singleton at `src/lib/prisma.ts` — always import from here.
- Schema at `prisma/schema.prisma`. After schema changes, run `npm run prisma:generate` then `npm run prisma:migrate`.
- Sensitive fields (GitHub tokens, Google OAuth tokens) are **encrypted at rest** using `src/lib/encryption.ts` (requires `ENCRYPTION_SECRET` env var — 32-byte hex string).

### Theme

Dark/light mode is persisted in `localStorage` under key `signal-works-theme`. A flash-prevention inline script in `src/app/layout.tsx` sets the `dark` class on `<html>` before React hydrates.

### AI & Knowledge

- **Claude (Anthropic)** is used for AI tutor responses (`src/server/assessment/aiService.ts`) and roadmap generation. Model defaults to `claude-3-5-sonnet-latest`, configurable via `AI_TUTOR_MODEL` env var.
- **RAG**: Lesson content is chunked and embedded via Voyage AI (`src/server/knowledge/embeddingService.ts`). Embeddings stored as `Float[]` on `DocumentChunk`. Searched via cosine similarity in `knowledgeService.ts`.
- **Google Docs**: Student roadmaps are stored as Google Docs (service account). See `src/lib/googleDocs.ts`.

### Assessment Flow

The intake assessment is session-based:
1. `POST /api/assessment/intake/start` — creates `AssessmentSession`
2. `POST /api/assessment/intake/submit` — saves `AssessmentResponse`, updates `UserSkillMastery`
3. `GET /api/assessment/intake/summary` — generates `AssessmentRoadmap` via Claude

Skill taxonomy is defined in `src/server/assessment/skillModel.ts` (dimensions + skill tags). Curriculum resources are in `src/server/lms/curriculumConfig.ts` (3-phase learning path).

### Tests

Tests live alongside their services in `__tests__/` subdirectories under `src/server/`. Jest with `jest-environment-jsdom`. The `@/` alias maps to `src/`.
