# Setting Up Your First Admin User

## Problem
When you sign in with Clerk for the first time, you might get redirected to the home page instead of the dashboard. This happens because your Clerk user doesn't have a `role` set in the metadata.

## Quick Fix Options

### Option 1: Set Role in Clerk Dashboard (Recommended)

1. Go to https://dashboard.clerk.com
2. Select your application
3. Click "Users" in the sidebar
4. Find your user (the email you signed in with)
5. Click on the user
6. Scroll to "Public metadata" section
7. Add this JSON:
   ```json
   {
     "role": "ADMIN"
   }
   ```
8. Click "Save"
9. **Sign out of your app and sign back in** (this refreshes your session)
10. Try accessing `/dashboard` again

### Option 2: Use the Admin Creation Script

Run this command in your terminal:

```bash
npx tsx scripts/create-admin.ts
```

Follow the prompts to create an admin user. You'll need:
- Admin email (same as your Clerk account email)
- Admin name
- Clerk ID (find this in Clerk Dashboard under your user profile)

### Option 3: Set Default Role for New Sign-ups

To automatically assign the ADMIN role to new sign-ups:

1. Go to Clerk Dashboard
2. Navigate to "Sessions" → "Session template"
3. Add custom claims to include role:
   ```json
   {
     "metadata": {
       "role": "ADMIN"
     }
   }
   ```

**Note:** This will make ALL new sign-ups admins. Only use this during initial setup!

## Verifying It Works

After setting the role:

1. Sign out completely
2. Sign back in
3. Visit `/dashboard` - you should be redirected to `/admin`
4. Check the browser console - you should see:
   ```
   🔐 Current User: { email: 'your@email.com', role: 'ADMIN', ... }
   ```

## Troubleshooting

### Still getting "Internal server error"?

Check the server logs for detailed error messages:

```bash
# In your terminal running the dev server, look for:
Failed to get or create user
```

### Database connection issues?

Test the database connection:

```bash
npx tsx scripts/test-auth.ts
```

This will show if the database is accessible and list all existing users.

### Need to reset everything?

```bash
# WARNING: This deletes all user data!
npx prisma db push --force-reset
```

Then re-run the admin creation script.

## Understanding Roles

The LMS has three roles:

- **STUDENT**: Default role for learners
- **INSTRUCTOR**: Can create and manage courses
- **ADMIN**: Full access to everything

Roles are set in Clerk's `publicMetadata.role` field and synced to the database.
