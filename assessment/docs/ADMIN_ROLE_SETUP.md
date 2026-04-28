# Admin Role Setup

The admin dashboard at `/admin` is protected by Clerk authentication and requires the user to have `role: "ADMIN"` set in their Clerk public metadata.

---

## How to Grant Admin Access

### 1. Sign in to the Clerk Dashboard

Go to [dashboard.clerk.com](https://dashboard.clerk.com) and open your application.

### 2. Find the user

Navigate to **Users** in the left sidebar and search for the user you want to promote.

### 3. Set public metadata

1. Click the user to open their profile
2. Scroll to the **Metadata** section
3. Click **Edit** next to **Public metadata**
4. Set the value to:

```json
{
  "role": "ADMIN"
}
```

5. Click **Save**

> The change takes effect on the user's next sign-in (or after their current session token expires — typically within minutes).

---

## How It Works

Clerk embeds `publicMetadata` as `metadata` in the signed JWT. The middleware reads this on every request to `/admin` or `/api/admin`:

```ts
// src/middleware.ts
const role = (auth.sessionClaims?.metadata as any)?.role;
if (role !== 'ADMIN') {
  // redirect to /sign-in?error=forbidden
}
```

In API routes and Server Components, use `requireAdmin()` from `@/lib/auth`:

```ts
import { requireAdmin } from '@/lib/auth';

// Throws 'Forbidden: Insufficient permissions' if not ADMIN
const user = await requireAdmin();
```

---

## Revoking Admin Access

Remove the `role` key from the user's public metadata in Clerk (or set it to `"STUDENT"`). Access is revoked on the next request.

---

## Admin Routes

| Route | Description |
|---|---|
| `/admin` | Student list — all submitted roadmaps |
| `/admin/roadmaps/[id]` | Full roadmap detail for a student |
