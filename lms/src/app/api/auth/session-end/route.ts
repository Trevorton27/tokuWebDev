/**
 * Session End API
 * Track user logout events
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { endLoginSession } from '@/server/activity/sessionTrackingService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // End all active sessions for user
    await endLoginSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/auth/session-end failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
