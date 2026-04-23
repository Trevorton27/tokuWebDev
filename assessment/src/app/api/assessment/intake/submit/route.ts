import { NextRequest, NextResponse } from 'next/server';
import { submitStepAnswer } from '@/server/assessment/intakeService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/assessment/intake/submit
 * Submit an answer for the current step
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { sessionId, stepId, answer } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    if (!stepId) {
      return NextResponse.json(
        { success: false, error: 'Missing stepId' },
        { status: 400 }
      );
    }

    if (answer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing answer' },
        { status: 400 }
      );
    }

    const result = await submitStepAnswer(sessionId, stepId, answer);

    return NextResponse.json({
      success: true,
      data: {
        gradeResult: {
          score: result.gradeResult.score,
          passed: result.gradeResult.passed,
          feedback: result.gradeResult.feedback,
          details: result.gradeResult.details,
        },
        skillUpdates: result.skillUpdates,
        nextStep: result.nextStep,
        isComplete: result.isComplete,
        progress: result.progress,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === 'Session not found') {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === 'Session already completed') {
      return NextResponse.json(
        { success: false, error: 'Session already completed' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.startsWith('Step not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    logger.error('POST /api/assessment/intake/submit failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
