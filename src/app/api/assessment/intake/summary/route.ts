import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionSummary,
  hasCompletedIntake,
  getLatestIntakeSession,
} from '@/server/assessment/intakeService';
import { getProfileSummary } from '@/server/assessment/skillProfileService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/assessment/intake/summary?sessionId=...
 * Get the summary for a completed assessment session
 * If no sessionId provided, returns the latest completed session
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // If sessionId provided, get that specific session's summary
    if (sessionId) {
      const summary = await getSessionSummary(sessionId);

      if (!summary) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    // Otherwise, check if user has completed intake and return their profile
    const hasCompleted = await hasCompletedIntake(user.id);
    const latestSession = await getLatestIntakeSession(user.id);
    const profileSummary = await getProfileSummary(user.id);

    const response = NextResponse.json({
      success: true,
      data: {
        hasCompletedIntake: hasCompleted,
        latestSession: latestSession
          ? {
              id: latestSession.id,
              status: latestSession.status,
              startedAt: latestSession.startedAt,
              completedAt: latestSession.completedAt,
            }
          : null,
        profileSummary,
      },
    });

    // Prevent caching - this data is user-specific
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/assessment/intake/summary failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get summary' },
      { status: 500 }
    );
  }
}
