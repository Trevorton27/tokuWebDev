import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedChallenges } from '@/server/assessment/adaptiveService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const challenges = await getRecommendedChallenges(user.id, limit);

    return NextResponse.json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    logger.error('GET /api/assessment/recommendations failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
