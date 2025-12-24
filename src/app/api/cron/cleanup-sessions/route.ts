/**
 * Cleanup Stale Sessions Cron Job
 * Automatically ends sessions inactive for more than 24 hours
 *
 * Should be called periodically (e.g., every hour) via:
 * - Vercel Cron Jobs
 * - External cron service (cron-job.org, etc.)
 * - Manual trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { endStaleSessions } from '@/server/activity/sessionTrackingService';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run cleanup
    const count = await endStaleSessions();

    logger.info('Stale session cleanup completed', { sessionsEnded: count });

    return NextResponse.json({
      success: true,
      message: `Ended ${count} stale session(s)`,
      sessionsEnded: count,
    });
  } catch (error) {
    logger.error('Stale session cleanup failed', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// For Vercel Cron Jobs
export const dynamic = 'force-dynamic';
