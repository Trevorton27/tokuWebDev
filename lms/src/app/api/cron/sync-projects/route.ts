/**
 * Cron Job: Sync All Active Projects
 * GET /api/cron/sync-projects
 *
 * This endpoint should be called periodically (e.g., every 15 minutes) by a cron service
 * Can be triggered by:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service (cron-job.org, etc.)
 *
 * Recommended schedule: Every 15 minutes during active hours
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { syncAllActiveProjects } from '@/server/github/projectSyncService';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization header check for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Cron job started: sync all projects');

    const result = await syncAllActiveProjects();

    logger.info('Cron job completed: sync all projects', result);

    return NextResponse.json({
      success: true,
      message: 'Project sync completed',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cron job failed: sync all projects', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
