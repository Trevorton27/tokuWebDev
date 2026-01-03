# GitHub & Vercel Integration Setup Guide

This guide explains how to set up real-time GitHub project tracking and Vercel deployment monitoring for your Signal Works LMS.

## Overview

The GitHub integration provides:
- **Real-time webhook notifications** for pushes, pull requests, and deployments
- **Automated milestone completion** based on commits, file changes, and branch merges
- **Activity timeline** showing all Git events
- **Vercel deployment tracking** with success/failure notifications
- **Periodic background sync** via cron jobs (fallback for missed webhooks)

## Architecture

### Phase 1: Polling-Based Sync (Already Implemented)
- Periodic API calls to GitHub (every 15 minutes via cron)
- Manual sync button in UI
- Good for: Historical data, missed webhook events

### Phase 2: Real-Time Webhooks (Newly Implemented)
- Instant updates when events occur
- Activity timeline with all Git events
- Milestone auto-completion
- Deployment status tracking

---

## Setup Instructions

### 1. GitHub Personal Access Token

First, create a GitHub Personal Access Token for API access:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Signal Works LMS"
4. Scopes needed:
   - `public_repo` (or `repo` for private repos)
   - `read:user`
5. Generate and copy the token
6. Add to your `.env`:
   ```env
   GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"
   ```

**Why?** Without this token, you're limited to 60 API requests/hour. With it, you get 5,000 requests/hour.

---

### 2. GitHub Webhook Setup

#### Step 1: Generate Webhook Secret

Generate a random secret for webhook signature verification:

```bash
# On Linux/Mac
openssl rand -hex 32

# Or use any random string generator
```

Add to your `.env`:
```env
GITHUB_WEBHOOK_SECRET="your_generated_secret_here"
```

#### Step 2: Configure GitHub Repository Webhook

For each student's repository:

1. Go to repository **Settings** > **Webhooks** > **Add webhook**

2. **Payload URL**: `https://yourdomain.com/api/webhooks/github`
   - Development: Use ngrok or similar tunnel: `https://abc123.ngrok.io/api/webhooks/github`
   - Production: Your live domain

3. **Content type**: `application/json`

4. **Secret**: Paste the `GITHUB_WEBHOOK_SECRET` value from your `.env`

5. **Which events?** Select individual events:
   - ✅ Pushes
   - ✅ Pull requests
   - ✅ Deployment statuses

6. **Active**: ✅ Checked

7. Click **Add webhook**

#### Step 3: Test Webhook

1. After creating the webhook, GitHub sends a "ping" event
2. Go to the webhook settings and click "Recent Deliveries"
3. You should see a successful ping with status 200
4. Response body should show: `{"success": true, "message": "Pong! Webhook is configured correctly."}`

---

### 3. Vercel Deployment Tracking Setup

#### Step 1: Generate Vercel Webhook Secret

```bash
openssl rand -hex 32
```

Add to your `.env`:
```env
VERCEL_WEBHOOK_SECRET="your_vercel_secret_here"
```

#### Step 2: Configure Vercel Project Webhook

1. Go to your Vercel project **Settings** > **Webhooks**

2. Click **Create Webhook**

3. **URL**: `https://yourdomain.com/api/webhooks/vercel`
   - Must be your production domain (Vercel doesn't support localhost)
   - For development, deploy to Vercel first, then configure

4. **Events** (select these):
   - ✅ Deployment Created
   - ✅ Deployment Ready (Success)
   - ✅ Deployment Error (Failed)

5. Click **Create**

#### Step 3: Link Projects

The Vercel webhook automatically matches deployments to student projects using the GitHub repository URL. Make sure:
- Student project's `repoFullName` matches the GitHub repo (e.g., "username/repo-name")
- Vercel project is connected to the same GitHub repository

---

### 4. Background Sync Cron Job

Set up periodic sync as a fallback for missed webhook events.

#### Option A: Vercel Cron Jobs (Recommended for Vercel deployments)

1. Create `vercel.json` in project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/sync-projects",
         "schedule": "*/15 * * * *"
       }
     ]
   }
   ```

2. Add `CRON_SECRET` to your `.env`:
   ```env
   CRON_SECRET="your_random_cron_secret"
   ```

3. Deploy to Vercel - cron will run automatically every 15 minutes

#### Option B: External Cron Service

Use a service like cron-job.org or EasyCron:

1. Create a new cron job with:
   - **URL**: `https://yourdomain.com/api/cron/sync-projects`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

2. Add `CRON_SECRET` to your `.env`

#### Option C: GitHub Actions

Create `.github/workflows/sync-projects.yml`:

```yaml
name: Sync Projects

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/sync-projects
```

Add `CRON_SECRET` to GitHub repository secrets.

---

## Using the Features

### 1. Linking a Student Project

Students can link their GitHub projects via the UI:

```typescript
// POST /api/student/projects
{
  "repoUrl": "https://github.com/username/my-project",
  "title": "E-commerce Website",
  "description": "Full-stack e-commerce site with Next.js",
  "isCurrent": true,
  "milestones": [
    {
      "title": "Set up authentication",
      "description": "Implement user login/signup",
      "order": 1,
      "linkedToFile": "src/app/api/auth",
      "linkedToCommitMsg": "auth.*complete"
    },
    {
      "title": "Create product catalog",
      "order": 2,
      "linkedToFile": "src/app/products",
      "linkedToCommitMsg": "products.*feature"
    },
    {
      "title": "Deploy to production",
      "order": 3,
      "linkedToBranch": "main"
    }
  ]
}
```

### 2. Milestone Auto-Completion

Milestones can auto-complete based on three criteria:

#### A. Commit Message Pattern
```typescript
linkedToCommitMsg: "feat.*auth|authentication.*complete"
```
Completes when a commit message matches the regex pattern (case-insensitive).

**Example commit that triggers:**
- "feat: authentication complete"
- "Authentication feature implemented"
- "feat(auth): user login ready"

#### B. File Existence
```typescript
linkedToFile: "src/app/api/auth"
```
Completes when a file matching this pattern is added or modified.

**Example commits that trigger:**
- Added: `src/app/api/auth/route.ts`
- Modified: `src/app/api/auth/login.ts`

#### C. Branch Merge
```typescript
linkedToBranch: "feature/auth"
```
Completes when a pull request from this branch is merged to main.

**Example that triggers:**
- PR #12: `feature/auth` → `main` (merged)

### 3. Activity Timeline Component

Display the activity timeline in any page:

```tsx
import ActivityTimeline from '@/modules/student/components/ActivityTimeline';

export default function StudentDashboard() {
  const projectId = "clxxx..."; // Get from current project

  return (
    <div>
      <ProjectSummary />
      
      {/* Add activity timeline below project summary */}
      <ActivityTimeline projectId={projectId} limit={20} />
    </div>
  );
}
```

The timeline automatically displays:
- 🔵 **Commits** - Push events with commit messages
- 🟣 **Pull Requests** - Opened/merged/closed PRs
- 🟢 **Deployments** - Successful deployments
- 🔴 **Failed Deployments** - Deployment failures
- 🟡 **Milestones** - Auto-completed milestones

### 4. Manual Sync

Students can manually trigger a sync:

```tsx
<button onClick={() => fetch(`/api/student/projects/${projectId}/sync`, { method: 'POST' })}>
  Sync Now
</button>
```

---

## Testing

### Test GitHub Webhooks

1. Make a commit and push to your repository:
   ```bash
   git commit -m "test: webhook integration"
   git push origin main
   ```

2. Check webhook delivery:
   - Go to GitHub repo **Settings** > **Webhooks**
   - Click on your webhook
   - View "Recent Deliveries"
   - Should show successful delivery with status 200

3. Check your database:
   ```sql
   SELECT * FROM "ProjectActivity" ORDER BY timestamp DESC LIMIT 5;
   ```
   You should see a new COMMIT activity record

### Test Pull Request Webhook

1. Create a branch and PR:
   ```bash
   git checkout -b test-feature
   git commit -m "test feature"
   git push origin test-feature
   # Create PR on GitHub
   ```

2. Merge the PR on GitHub

3. Check webhook deliveries and database for PULL_REQUEST_MERGED activity

### Test Milestone Auto-Completion

1. Create a milestone with `linkedToCommitMsg: "test.*complete"`

2. Make a commit with message: "test webhook complete"

3. Check that milestone is marked as completed:
   ```sql
   SELECT * FROM "ProjectMilestone" WHERE completed = true;
   ```

4. Check for MILESTONE_COMPLETED activity in the timeline

### Test Vercel Deployment

1. Push to main branch (triggers Vercel deployment)

2. Wait for deployment to complete

3. Check webhook deliveries in Vercel

4. Verify deployment activity in timeline:
   ```sql
   SELECT * FROM "ProjectActivity" 
   WHERE "activityType" IN ('DEPLOYMENT_SUCCESS', 'DEPLOYMENT_FAILED')
   ORDER BY timestamp DESC;
   ```

---

## Troubleshooting

### Webhooks Not Receiving Events

**Check:**
1. Webhook URL is publicly accessible (use ngrok for local development)
2. Webhook secret matches in GitHub and `.env`
3. SSL certificate is valid (webhooks require HTTPS)
4. Firewall/network doesn't block GitHub IPs

**Debug:**
- Check webhook delivery history in GitHub
- Check server logs: `grep "GitHub webhook" logs/app.log`
- Test endpoint manually:
  ```bash
  curl -X POST https://yourdomain.com/api/webhooks/github \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -d '{"zen": "test"}'
  ```

### Signature Verification Failing

**Causes:**
1. Wrong secret in `.env`
2. Request body was modified/parsed before verification
3. Character encoding issues

**Fix:**
- Ensure you use `request.text()` NOT `request.json()` before verification
- Check that `GITHUB_WEBHOOK_SECRET` exactly matches GitHub webhook secret

### Milestones Not Auto-Completing

**Check:**
1. Milestone criteria are correctly formatted (regex is case-insensitive)
2. Commits are on the default branch (usually `main`)
3. Webhook events are being received
4. Database sync is working

**Debug:**
```sql
-- Check project default branch
SELECT "defaultBranch", "repoFullName" FROM "StudentProject";

-- Check milestone criteria
SELECT title, "linkedToCommitMsg", "linkedToFile", "linkedToBranch" 
FROM "ProjectMilestone" WHERE completed = false;

-- Check recent activities
SELECT * FROM "ProjectActivity" ORDER BY timestamp DESC LIMIT 10;
```

### Vercel Webhooks Not Working

**Common issues:**
1. Webhook URL must be HTTPS (can't use localhost)
2. Deploy to Vercel first, then configure webhook
3. Ensure GitHub repo is linked to Vercel project
4. Check that `repoFullName` in database matches GitHub repo

---

## Security Best Practices

1. **Always verify webhook signatures** - Don't skip this even in development
2. **Use environment variables** - Never hardcode secrets
3. **Rotate secrets periodically** - Change webhook secrets every few months
4. **Use HTTPS only** - GitHub/Vercel require SSL
5. **Rate limit webhooks** - Prevent abuse (already implemented in handlers)
6. **Log suspicious activity** - Monitor failed signature verifications

---

## API Reference

### Webhook Endpoints

#### `POST /api/webhooks/github`
Receives GitHub webhook events.

**Headers:**
- `x-github-event`: Event type (push, pull_request, deployment_status, ping)
- `x-github-delivery`: Unique delivery ID
- `x-hub-signature-256`: HMAC signature for verification

**Supported Events:**
- `push` - Commit pushes
- `pull_request` - PR opened/closed/merged
- `deployment_status` - Deployment updates
- `ping` - Webhook test

#### `POST /api/webhooks/vercel`
Receives Vercel deployment webhooks.

**Headers:**
- `x-vercel-signature`: SHA1 HMAC signature

**Supported Events:**
- `deployment.created`
- `deployment.ready` (success)
- `deployment.error` (failed)

### Student API Endpoints

#### `GET /api/student/current-project`
Get current active project with milestones and stats.

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "clxxx",
    "title": "My Project",
    "repoUrl": "https://github.com/user/repo",
    "lastCommitMsg": "feat: add login",
    "lastCommitDate": "2024-01-15T10:30:00Z",
    "totalCommits": 42,
    "openPRs": 2,
    "closedPRs": 8,
    "deploymentStatus": "SUCCESS",
    "milestones": [...],
    "stats": {
      "totalMilestones": 5,
      "completedMilestones": 3,
      "progress": 60
    }
  }
}
```

#### `GET /api/student/projects`
List all student projects.

#### `POST /api/student/projects`
Create/link a new project with milestones.

#### `POST /api/student/projects/[id]/sync`
Manually trigger GitHub sync for a project.

#### `GET /api/student/projects/[id]/activity?limit=20`
Fetch activity timeline for a project.

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "clxxx",
      "activityType": "COMMIT",
      "title": "Pushed 3 commits",
      "description": "feat: implement user authentication",
      "metadata": {
        "commitSha": "abc123",
        "commitCount": 3,
        "author": "John Doe",
        "branch": "main"
      },
      "url": "https://github.com/user/repo/commit/abc123",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### Cron Endpoint

#### `GET /api/cron/sync-projects`
Background job to sync all active projects.

**Headers:**
- `Authorization: Bearer YOUR_CRON_SECRET`

---

## Next Steps

After setting up the integration:

1. **Test with a sample project** - Create a test repo and verify all features work
2. **Document for students** - Create a guide showing students how to link their repos
3. **Monitor webhook deliveries** - Check regularly that webhooks are functioning
4. **Set up alerts** - Monitor failed webhooks and sync errors
5. **Optimize sync frequency** - Adjust cron schedule based on usage patterns

---

## Support

For issues or questions:
- Check webhook delivery history in GitHub/Vercel
- Review server logs for error messages
- Verify all environment variables are set correctly
- Test webhooks using the testing section above

Generated with Claude Code - https://claude.com/claude-code
