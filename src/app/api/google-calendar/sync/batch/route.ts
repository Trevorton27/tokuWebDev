/**
 * Google Calendar Batch Sync Endpoint
 * POST /api/google-calendar/sync/batch
 * Manually sync all visible events to user's Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { batchSyncEvents } from '@/server/google-calendar/syncService';

/**
 * POST /api/google-calendar/sync/batch
 * Trigger a manual batch sync of all events visible to the user
 */
export async function POST() {
  try {
    const user = await requireAuth();

    logger.info('Manual batch sync initiated', { userId: user.id });

    // Trigger batch sync
    const result = await batchSyncEvents(user.id);

    logger.info('Manual batch sync completed', {
      userId: user.id,
      result,
    });

    return NextResponse.json({
      success: true,
      message: 'Batch sync completed',
      result: {
        total: result.total,
        created: result.created,
        updated: result.updated,
        failed: result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'Google Calendar not connected') {
      return NextResponse.json(
        { success: false, error: 'Google Calendar not connected. Please connect your Google Calendar first.' },
        { status: 400 }
      );
    }

    logger.error('Batch sync failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Batch sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
