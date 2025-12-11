import { NextRequest, NextResponse } from 'next/server';
import { listChallenges } from '@/server/assessment/challengeService';
import { logger } from '@/lib/logger';
import type { ChallengeFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ChallengeFilters = {};

    // Parse difficulty filter
    const difficultyParam = searchParams.get('difficulty');
    if (difficultyParam) {
      filters.difficulty = difficultyParam.split(',') as any;
    }

    // Parse language filter
    const languageParam = searchParams.get('language');
    if (languageParam) {
      filters.language = languageParam.split(',') as any;
    }

    // Parse tags filter
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',');
    }

    // Parse search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filters.search = searchQuery;
    }

    const challenges = await listChallenges(filters);

    return NextResponse.json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    logger.error('GET /api/assessment/challenges failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
