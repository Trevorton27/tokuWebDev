import { NextRequest, NextResponse } from 'next/server';
import { startAssessmentSession } from '@/server/assessment/intakeService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/assessment/intake/start
 * Start or resume an intake assessment session
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await startAssessmentSession(user.id, 'INTAKE');

    return NextResponse.json({
      success: true,
      data: {
        sessionId: result.sessionId,
        firstStep: result.firstStep,
        totalSteps: result.totalSteps,
        estimatedMinutes: result.estimatedMinutes,
        isResuming: result.isResuming,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('POST /api/assessment/intake/start failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start assessment session' },
      { status: 500 }
    );
  }
}
