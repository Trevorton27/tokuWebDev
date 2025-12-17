# Database Seed Scripts

This directory contains scripts for seeding the database with sample data.

## Production Seed Data

The `seed-production.ts` script creates:
- **3 Instructors**
- **10 Students**
- **5 Courses** (with realistic content)
- **19 Lessons** (distributed across courses)

### Course Details

1. **JavaScript Fundamentals** (Sarah Chen) - 5 lessons
2. **React & Modern Frontend Development** (Sarah Chen) - 4 lessons
3. **Node.js Backend Development** (Marcus Johnson) - 3 lessons
4. **Database Design & SQL Mastery** (Marcus Johnson) - 3 lessons
5. **Full-Stack TypeScript Development** (Elena Rodriguez) - 4 lessons

## Running the Seed Script

### Option 1: Using npm script (Recommended)

```bash
npm run seed:prod
```

### Option 2: Using the shell script

```bash
./scripts/seed-prod.sh
```

### Option 3: Direct execution

```bash
npx tsx scripts/seed-production.ts
```

## Login Credentials

After seeding, you can login with any of the created user emails:

**Password for all users:** `Password123!`

### Instructors
- sarah.chen@signalworks.com
- marcus.johnson@signalworks.com
- elena.rodriguez@signalworks.com

### Students
- alex.kim@student.com
- jordan.smith@student.com
- taylor.brown@student.com
- casey.wilson@student.com
- morgan.davis@student.com
- riley.anderson@student.com
- dakota.martinez@student.com
- skyler.garcia@student.com
- quinn.lopez@student.com
- avery.nguyen@student.com

## Important Notes

⚠️ **This script uses `upsert`** - it will update existing records if they already exist (based on email), so it's safe to run multiple times.

⚠️ **Make sure your DATABASE_URL** environment variable points to the correct database before running.

## Environment Setup

The seed script uses the `DATABASE_URL` from your `.env` file. Make sure it's configured:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

For production, this should point to your Vercel Postgres or other production database.
