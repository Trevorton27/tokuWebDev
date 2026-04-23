/**
 * GitHub Activity API
 * Get user's GitHub repository activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getGitHubActivity,
  getGitHubStatistics,
} from '@/server/activity/githubEventService';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user's GitHub info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        githubUsername: true,
        githubRepoUrl: true,
      },
    });

    // If no GitHub account linked, return empty state
    if (!dbUser?.githubUsername) {
      return NextResponse.json({
        success: true,
        data: {
          username: null,
          repoUrl: null,
          recentEvents: [],
          weeklyStats: {
            commits: 0,
            prs: 0,
            additions: 0,
            deletions: 0,
          },
        },
      });
    }

    // Get recent events (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const events = await getGitHubActivity(user.id, {
      startDate: weekAgo,
      limit: 10,
    });

    // Get weekly statistics
    const stats = await getGitHubStatistics(user.id, 7);

    return NextResponse.json({
      success: true,
      data: {
        username: dbUser.githubUsername,
        repoUrl: dbUser.githubRepoUrl,
        recentEvents: events.map((e) => ({
          eventType: e.eventType,
          action: e.action,
          repository: e.repository,
          timestamp: e.timestamp,
          commitCount: e.commitCount,
        })),
        weeklyStats: {
          commits: stats.totalCommits,
          prs: stats.totalPRs,
          additions: stats.totalAdditions,
          deletions: stats.totalDeletions,
        },
      },
    });
  } catch (error) {
    logger.error('GET /api/activity/github failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub activity' },
      { status: 500 }
    );
  }
}
