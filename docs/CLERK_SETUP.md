# Clerk Authentication Setup Guide

This guide will walk you through setting up Clerk authentication for the Signal Works LMS.

## What Was Implemented

### ✅ Complete Clerk Integration
- Clerk authentication library installed
- Auth helpers updated to use Clerk
- Middleware configured for route protection
- Role-based access control
- Environment variables configured
- Test endpoints page for API testing

---

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose your authentication providers (Email, Google, GitHub, etc.)

---

## Step 2: Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)

---

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_here"

# Clerk URLs (optional - customize sign in/up pages)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

**Important**: Never commit `.env.local` to version control!

---

## Step 4: Configure User Roles in Clerk

By default, users don't have roles assigned. You need to set up roles in Clerk:

### Option 1: Set Roles Manually (For Testing)

1. Go to Clerk Dashboard → Users
2. Select a user
3. Go to the **Public metadata** section
4. Add the following JSON:

```json
{
  "role": "ADMIN"
}
```

Available roles:
- `STUDENT` (default)
- `INSTRUCTOR`
- `ADMIN`

### Option 2: Set Roles Programmatically (Production)

Create a webhook or API route to set roles when users sign up:

```typescript
// Example: Set role during sign-up
import { clerkClient } from '@clerk/nextjs/server';

async function setUserRole(userId: string, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role },
  });
}
```

### Option 3: Use Clerk Webhooks

1. In Clerk Dashboard → Webhooks
2. Create a new webhook
3. Listen for `user.created` event
4. Set the role in your webhook handler

---

## Step 5: Start the Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Testing Authentication

### Access Protected Routes

1. Visit any protected route (e.g., `/admin`, `/instructor`, `/courses`)
2. You'll be redirected to Clerk's sign-in page
3. Sign in or create an account
4. You'll be redirected back to the original page

### Test API Endpoints

1. Navigate to: http://localhost:3000/test-endpoints
2. Click "Test" on any endpoint
3. View results in the UI and browser console
4. Test custom endpoints with the custom tester

### Check Console Logs

All test results are logged to the browser console with:
- 🧪 Test start
- ✅ Success results
- ❌ Error results
- 📊 Response data

---

## Architecture Overview

### Authentication Flow

```
User Request
    ↓
Middleware (middleware.ts)
    ↓
Clerk Authentication Check
    ↓
Role-Based Access Control
    ↓
Protected Route/API
```

### File Structure

```
src/
├── lib/
│   └── auth.ts                 # Auth helpers (getCurrentUser, requireAuth, requireRole)
├── middleware.ts               # Clerk middleware with route protection
├── app/
│   ├── layout.tsx             # ClerkProvider wrapper
│   ├── admin/                 # Admin routes (ADMIN role required)
│   ├── instructor/            # Instructor routes (INSTRUCTOR/ADMIN required)
│   ├── test-endpoints/        # API testing page
│   └── api/
│       └── admin/             # Admin API routes (ADMIN role required)
```

---

## Auth Helper Functions

### `getCurrentUser()`

Get the currently authenticated user:

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
// Returns: { id, email, name, role } or null
```

### `requireAuth()`

Require authentication (throws error if not authenticated):

```typescript
import { requireAuth } from '@/lib/auth';

const user = await requireAuth();
// Returns: { id, email, name, role }
// Throws: Error('Unauthorized') if not authenticated
```

### `requireRole(roles)`

Require specific role(s):

```typescript
import { requireRole } from '@/lib/auth';

// Single role
const user = await requireRole(['ADMIN']);

// Multiple roles
const user = await requireRole(['ADMIN', 'INSTRUCTOR']);
// Throws: Error('Forbidden: Insufficient permissions') if role doesn't match
```

---

## Protected Routes

### Middleware Configuration

The middleware automatically protects these routes:

- `/admin/**` - Requires ADMIN role
- `/instructor/**` - Requires INSTRUCTOR or ADMIN role
- `/courses/**` - Requires authentication
- `/assessment/**` - Requires authentication
- `/test-endpoints/**` - Requires authentication

Public routes (no auth required):
- `/` - Home page
- `/login` - Login page
- `/sign-in` - Clerk sign-in
- `/sign-up` - Clerk sign-up

---

## API Route Protection

All admin API routes are protected with `requireRole(['ADMIN'])`:

```typescript
// Example: /api/admin/users/route.ts
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // This will throw an error if user is not an ADMIN
    await requireRole(['ADMIN']);

    // Your logic here
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
```

---

## User Metadata Structure

Clerk stores user data in different locations:

### Public Metadata
Accessible to everyone (used for roles):

```json
{
  "role": "ADMIN"
}
```

### Private Metadata
Only accessible server-side:

```json
{
  "internalId": "user_123",
  "subscriptionStatus": "active"
}
```

---

## Clerk Components

### Sign-In Button

```typescript
import { SignInButton } from '@clerk/nextjs';

<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>
```

### User Button

```typescript
import { UserButton } from '@clerk/nextjs';

<UserButton afterSignOutUrl="/" />
```

### Sign Out

```typescript
import { SignOutButton } from '@clerk/nextjs';

<SignOutButton>
  <button>Sign Out</button>
</SignOutButton>
```

---

## Testing Checklist

- [ ] Sign up with a new account
- [ ] Sign in with existing account
- [ ] Access protected routes
- [ ] Test role-based access (admin, instructor, student)
- [ ] Test API endpoints via `/test-endpoints`
- [ ] Check console logs for detailed results
- [ ] Test sign out functionality
- [ ] Verify redirects work correctly

---

## Troubleshooting

### Issue: "Unauthorized" errors

**Solution**: Check that:
1. Environment variables are set correctly
2. User is signed in
3. User has the correct role in public metadata

### Issue: Redirects not working

**Solution**: Check that:
1. `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set
2. Middleware is configured correctly
3. No conflicting route matchers

### Issue: Roles not working

**Solution**:
1. Go to Clerk Dashboard → Users
2. Select your user
3. Add `{ "role": "ADMIN" }` to public metadata
4. Sign out and sign back in

### Issue: "Cannot find module @clerk/nextjs"

**Solution**:
```bash
npm install @clerk/nextjs
```

---

## Production Deployment

### Environment Variables

Set these in your production environment (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

### Domain Configuration

In Clerk Dashboard:
1. Go to **Domains**
2. Add your production domain
3. Update environment variables with production keys

### Webhooks (Optional)

Set up webhooks to sync user data:
1. Go to **Webhooks** in Clerk Dashboard
2. Add your webhook endpoint URL
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Implement webhook handler in `/api/webhooks/clerk`

---

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [User Metadata](https://clerk.com/docs/users/metadata)
- [Webhooks](https://clerk.com/docs/integrations/webhooks)

---

## Summary

✅ Clerk authentication fully integrated
✅ Role-based access control (ADMIN, INSTRUCTOR, STUDENT)
✅ Protected routes and API endpoints
✅ Test endpoints page for easy API testing
✅ Console logging for debugging
✅ Environment variables configured
✅ Middleware protection enabled

**Next Steps**:
1. Create Clerk account and get API keys
2. Add keys to `.env.local`
3. Start development server
4. Create test users and assign roles
5. Test endpoints via `/test-endpoints`
