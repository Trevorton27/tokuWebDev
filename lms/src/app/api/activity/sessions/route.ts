/**
 * Activity Sessions API
 * Get user login session history and statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getLoginSessions,
  calculateSessionDuration,
  getSessionStatistics,
} from '@/server/activity/sessionTrackingService';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent sessions
    const sessions = await getLoginSessions(user.id, { limit });

    // Get statistics for last 7 days
    const stats = await getSessionStatistics(user.id, 7);

    return NextResponse.json({
      success: true,
      data: {
        recentSessions: sessions.map((s) => ({
          loginAt: s.loginAt,
          duration: calculateSessionDuration(s),
          deviceType: s.deviceType,
          browser: s.browser,
          isActive: s.isActive,
        })),
        totalSessions: stats.totalSessions,
        totalTime: stats.totalDuration,
        avgDuration: Math.round(stats.avgDuration),
        activeSessions: stats.activeSessions,
      },
    });
  } catch (error) {
    logger.error('GET /api/activity/sessions failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
