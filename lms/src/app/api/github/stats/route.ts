/**
 * GitHub Statistics API
 * Fetch aggregated statistics for user's GitHub account
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { decrypt } from '@/lib/encryption';
import {
  fetchUserStatistics,
  GitHubRateLimitError,
  GitHubAuthError,
} from '@/server/github/githubApiClient';

/**
 * GET - Fetch GitHub user statistics
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get GitHub username and PAT from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        githubUsername: true,
        githubPersonalAccessToken: true,
      },
    });

    if (!dbUser?.githubUsername) {
      return NextResponse.json(
        {
          success: false,
          error: 'GitHub username not configured. Please set your GitHub username first.',
        },
        { status: 400 }
      );
    }

    // Decrypt user's PAT if available
    let userToken: string | undefined;
    if (dbUser.githubPersonalAccessToken) {
      try {
        userToken = decrypt(dbUser.githubPersonalAccessToken);
      } catch (error) {
        logger.warn('Failed to decrypt user GitHub PAT', { userId: user.id });
      }
    }

    // Fetch statistics (use user's token if available)
    const statistics = await fetchUserStatistics(dbUser.githubUsername, userToken);

    // Get top languages sorted by count
    const topLanguages = Object.entries(statistics.languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / statistics.totalRepos) * 100),
      }));

    return NextResponse.json({
      success: true,
      stats: {
        repositories: statistics.totalRepos,
        stars: statistics.totalStars,
        forks: statistics.totalForks,
        recentActivity: statistics.recentActivity,
        topLanguages,
      },
    });
  } catch (error) {
    logger.error('GET /api/github/stats failed', error);

    // Handle rate limit errors
    if (error instanceof GitHubRateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorType: 'RATE_LIMIT',
          resetAt: error.resetAt?.toISOString(),
        },
        { status: 429 }
      );
    }

    // Handle authentication errors
    if (error instanceof GitHubAuthError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorType: 'AUTH_ERROR',
        },
        { status: 401 }
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
