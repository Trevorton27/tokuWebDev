/**
 * GitHub Activity Data API
 * Fetch contribution data for activity graph visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { decrypt } from '@/lib/encryption';
import {
  fetchContributionData,
  fetchUserStatistics,
  GitHubRateLimitError,
  GitHubAuthError,
} from '@/server/github/githubApiClient';

/**
 * GET - Fetch GitHub activity and contribution data
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch contribution data (use user's token if available)
    const contributions = await fetchContributionData(
      dbUser.githubUsername,
      Math.min(days, 90), // GitHub API only provides last 90 days
      userToken
    );

    let statistics = null;
    if (includeStats) {
      statistics = await fetchUserStatistics(dbUser.githubUsername, userToken);
    }

    // Calculate summary metrics
    const totalContributions = contributions.reduce(
      (sum, day) => sum + day.count,
      0
    );
    const activeDays = contributions.filter((day) => day.count > 0).length;
    const maxContributions = Math.max(
      ...contributions.map((day) => day.count),
      0
    );
    const avgContributions =
      activeDays > 0 ? totalContributions / activeDays : 0;

    return NextResponse.json({
      success: true,
      data: {
        contributions,
        summary: {
          total: totalContributions,
          activeDays,
          maxInDay: maxContributions,
          average: Math.round(avgContributions * 10) / 10,
          period: `${days} days`,
        },
        ...(statistics && { statistics }),
      },
    });
  } catch (error) {
    logger.error('GET /api/github/activity failed', error);

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
      { success: false, error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}
