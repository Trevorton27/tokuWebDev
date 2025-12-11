import { NextRequest, NextResponse } from 'next/server';
import { recordAttempt } from '@/server/assessment/masteryService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { challengeId, code, passed, score, timeSpent, hintsUsed } = body;

    if (!challengeId || code === undefined || passed === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attempt = await recordAttempt({
      userId: user.id,
      challengeId,
      code,
      passed,
      score: score || 0,
      timeSpent: timeSpent || 0,
      hintsUsed: hintsUsed || 0,
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    logger.error('POST /api/assessment/mastery failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record attempt' },
      { status: 500 }
    );
  }
}
