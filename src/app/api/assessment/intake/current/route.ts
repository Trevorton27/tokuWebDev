import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStep, goToPreviousStep } from '@/server/assessment/intakeService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/assessment/intake/current?sessionId=...
 * Get the current step in an assessment session
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }

    const result = await getCurrentStep(sessionId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Session not found or no current step' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        step: result.step,
        progress: result.progress,
        previousAnswer: result.previousAnswer,
        canGoBack: result.canGoBack,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/assessment/intake/current failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get current step' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assessment/intake/current
 * Navigate to previous step (go back)
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    if (action === 'back') {
      const result = await goToPreviousStep(sessionId);

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Cannot go back from this step' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          step: result.step,
          progress: result.progress,
          previousAnswer: result.previousAnswer,
          canGoBack: result.canGoBack,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('POST /api/assessment/intake/current failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to navigate' },
      { status: 500 }
    );
  }
}
