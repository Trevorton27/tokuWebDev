# LMS Environment Variables Reference

---

## Database

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for the Neon serverless database. Used by Prisma for all data reads/writes — users, courses, progress, etc. |

---

## Clerk Authentication

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key for the Clerk JS SDK in the browser. Safe to expose — initializes the Clerk frontend components (sign-in modal, user button, etc.). |
| `CLERK_SECRET_KEY` | Server-side secret for Clerk API calls. Used to verify sessions, fetch user data, and manage users from API routes. Never exposed to the browser. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Path Clerk redirects unauthenticated users to for sign-in. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Path Clerk redirects new users to for registration. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Where users land after a successful sign-in. Should be `/dashboard` so role-based routing sends admins → `/admin`, instructors → `/instructor`, students → `/student`. |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Where new users land after completing registration. Should be `/dashboard` for the same role-based routing. |

---

## AI / Claude

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Secret key for the Anthropic API. Used by the AI tutor feature to send messages to Claude and stream responses back to students. |
| `AI_TUTOR_MODEL` | Specifies which Claude model to use (e.g. `claude-opus-4-5-20251101`). Controls the capability/cost tradeoff of the AI tutor. |

---

## Embeddings

| Variable | Purpose |
|---|---|
| `EMBEDDINGS_API_KEY` | API key for the embeddings provider (Voyage AI when using `voyage-2`). Used to convert text into vector representations for semantic search. |
| `EMBEDDINGS_API_URL` | Endpoint for the embeddings API (e.g. `https://api.voyageai.com/v1/embeddings`). |
| `EMBEDDINGS_MODEL` | The embeddings model to use (`voyage-2`). Determines the dimensionality and quality of text vectors for course content search. |

---

## GitHub Integration

| Variable | Purpose |
|---|---|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | PAT for the GitHub API. Used to fetch repo data, display student activity, pull curriculum content from GitHub, and avoid the 60 req/hr unauthenticated rate limit. |
| `GITHUB_WEBHOOK_SECRET` | Shared secret to verify that incoming webhook payloads are genuinely from GitHub. Used to trigger LMS actions when repos are updated. |

---

## Google Integration

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID for Google. Used to initiate the Google Calendar OAuth flow so students/instructors can sync events. |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret for Google. Exchanged server-side for access/refresh tokens during the Calendar auth flow. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email of the Google service account. Used to authenticate server-to-server with Google APIs (e.g. reading a shared Google Doc). |
| `GOOGLE_PRIVATE_KEY` | RSA private key for the service account. Signs JWTs to authenticate as the service account without user interaction. |
| `GOOGLE_DOCS_DOCUMENT_ID` | The ID of the specific Google Doc used as a curriculum/content source. Extracted from the doc's URL. |
| `GOOGLE_REDIRECT_URI` | The OAuth callback URL Google redirects to after a user approves Calendar access. Must match what's registered in Google Cloud Console. |

---

## Security & Infrastructure

| Variable | Purpose |
|---|---|
| `ENCRYPTION_SECRET` | 32-byte hex key used to encrypt sensitive data at rest (e.g. stored OAuth refresh tokens, webhook secrets in the database). |
| `CRON_SECRET` | Bearer token that scheduled cron job endpoints check before executing. Prevents unauthorized external triggers of jobs like grade sync or reminders. |
| `IP_HASH_SALT` | Salt for one-way hashing of IP addresses before storing them. Enables abuse detection/rate limiting without storing raw IPs (privacy-preserving). |
| `VERCEL_WEBHOOK_SECRET` | Vercel-provided secret to verify deployment webhook payloads. Used to trigger post-deploy actions (e.g. cache invalidation, deployment tracking). |

---

## Cross-App Communication

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ASSESSMENT_URL` | Public URL of the Assessment app. Used in the LMS to generate links that send students to the assessment flow. |
| `ASSESSMENT_API_URL` | Server-side base URL for making internal API calls from LMS → Assessment (e.g. fetching results, triggering evaluations). |
| `INTERNAL_API_SECRET` | Shared secret included in server-to-server requests between LMS and Assessment apps to authenticate internal API calls and prevent unauthorized access. |
