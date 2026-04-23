/**
 * Activity Metrics API
 * Get user's engagement score and activity metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getActivitySummary,
  calculateStudyStreak,
  getWeeklyTrend,
} from '@/server/activity/activityMetricsService';
import { normalizeValue } from '@/lib/activityUtils';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'week' | 'month') || 'week';

    // Get activity summary
    const summary = await getActivitySummary(user.id, period);

    // Get study streak
    const streak = await calculateStudyStreak(user.id);

    // Get weekly trend
    const weeklyActivity = await getWeeklyTrend(user.id);

    // Calculate trend direction
    const calculateTrend = () => {
      if (weeklyActivity.length < 2) return 'stable';
      const recent = weeklyActivity.slice(-3);
      const older = weeklyActivity.slice(0, 3);
      const recentAvg =
        recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
      const olderAvg =
        older.reduce((sum, d) => sum + d.score, 0) / older.length;

      if (recentAvg > olderAvg * 1.1) return 'up';
      if (recentAvg < olderAvg * 0.9) return 'down';
      return 'stable';
    };

    return NextResponse.json({
      success: true,
      data: {
        engagementScore: summary.avgEngagementScore,
        trend: calculateTrend(),
        weeklyActivity,
        breakdown: {
          logins: normalizeValue(summary.totalLogins, 10),
          coding: normalizeValue(summary.challengeAttempts, 15),
          github: normalizeValue(summary.githubCommits, 20),
          learning: normalizeValue(summary.totalSessionTime / 3600, 15),
        },
        streak,
      },
    });
  } catch (error) {
    logger.error('GET /api/activity/metrics failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
