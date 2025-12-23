/**
 * Activity Metrics Service
 * Calculate and aggregate user activity metrics and engagement scores
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { calculateSessionDuration } from './sessionTrackingService';
import { getStartOfDay, getEndOfDay } from '@/lib/activityUtils';
import type { User } from '@prisma/client';

interface EngagementData {
  loginCount: number;
  sessionDuration: number;
  commits: number;
  prs: number;
  attempts: number;
  masteryEvents: number;
}

/**
 * Calculate engagement score using weighted formula
 * @param data - Engagement data
 * @returns Engagement score (0-100)
 */
export function calculateEngagementScore(data: EngagementData): number {
  const weights = {
    login: 5,
    sessionHour: 10,
    commit: 8,
    pr: 15,
    attempt: 7,
    masteryEvent: 5,
  };

  const score =
    data.loginCount * weights.login +
    (data.sessionDuration / 3600) * weights.sessionHour +
    data.commits * weights.commit +
    data.prs * weights.pr +
    data.attempts * weights.attempt +
    data.masteryEvents * weights.masteryEvent;

  return Math.min(100, Math.round(score));
}

/**
 * Calculate daily metrics for a user
 * @param userId - User ID
 * @param date - Date to calculate metrics for (defaults to today)
 */
export async function calculateDailyMetrics(
  userId: string,
  date: Date = new Date()
): Promise<void> {
  try {
    const startOfDay = getStartOfDay(date);
    const endOfDay = getEndOfDay(date);

    // Fetch login sessions
    const loginSessions = await prisma.loginSession.findMany({
      where: {
        userId,
        loginAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const loginCount = loginSessions.length;
    const totalSessionDuration = loginSessions.reduce(
      (sum, session) => sum + calculateSessionDuration(session),
      0
    );
    const avgSessionDuration =
      loginCount > 0 ? totalSessionDuration / loginCount : 0;

    // Fetch GitHub events
    const githubEvents = await prisma.gitHubEvent.findMany({
      where: {
        userId,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    });

    const commitCount = githubEvents
      .filter((e) => e.eventType === 'push')
      .reduce((sum, e) => sum + (e.commitCount || 0), 0);

    const prCount = githubEvents.filter(
      (e) => e.eventType === 'pull_request'
    ).length;

    // Fetch LMS engagement
    const attempts = await prisma.attempt.count({
      where: {
        userId,
        attemptedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const masteryEvents = await prisma.masteryEvent.count({
      where: {
        userId,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Calculate engagement score
    const engagementScore = calculateEngagementScore({
      loginCount,
      sessionDuration: totalSessionDuration,
      commits: commitCount,
      prs: prCount,
      attempts,
      masteryEvents,
    });

    // Store metrics
    const metrics = [
      { metricType: 'login_count', value: loginCount },
      { metricType: 'session_duration', value: totalSessionDuration },
      { metricType: 'avg_session_duration', value: avgSessionDuration },
      { metricType: 'github_commits', value: commitCount },
      { metricType: 'github_prs', value: prCount },
      { metricType: 'challenge_attempts', value: attempts },
      { metricType: 'mastery_events', value: masteryEvents },
      { metricType: 'engagement_score', value: engagementScore },
    ];

    for (const metric of metrics) {
      await prisma.activityMetric.upsert({
        where: {
          userId_metricType_date_period: {
            userId,
            metricType: metric.metricType,
            date: startOfDay,
            period: 'daily',
          },
        },
        update: { value: metric.value },
        create: {
          userId,
          metricType: metric.metricType,
          value: metric.value,
          date: startOfDay,
          period: 'daily',
        },
      });
    }

    logger.info('Daily metrics calculated', {
      userId,
      date: startOfDay.toISOString().split('T')[0],
      engagementScore,
    });
  } catch (error) {
    logger.error('Failed to calculate daily metrics', error, { userId });
    throw new Error('Failed to calculate daily metrics');
  }
}

/**
 * Get activity summary for a user
 * @param userId - User ID
 * @param period - Time period ('week' or 'month')
 * @returns Activity summary
 */
export async function getActivitySummary(
  userId: string,
  period: 'week' | 'month' = 'week'
): Promise<{
  totalLogins: number;
  totalSessionTime: number;
  githubCommits: number;
  githubPRs: number;
  challengeAttempts: number;
  avgEngagementScore: number;
}> {
  try {
    const days = period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const metrics = await prisma.activityMetric.findMany({
      where: {
        userId,
        date: { gte: startDate },
        period: 'daily',
      },
    });

    const getMetricSum = (type: string) =>
      metrics.filter((m) => m.metricType === type).reduce((sum, m) => sum + m.value, 0);

    const getMetricAvg = (type: string) => {
      const values = metrics.filter((m) => m.metricType === type);
      if (values.length === 0) return 0;
      return values.reduce((sum, m) => sum + m.value, 0) / values.length;
    };

    return {
      totalLogins: getMetricSum('login_count'),
      totalSessionTime: getMetricSum('session_duration'),
      githubCommits: getMetricSum('github_commits'),
      githubPRs: getMetricSum('github_prs'),
      challengeAttempts: getMetricSum('challenge_attempts'),
      avgEngagementScore: Math.round(getMetricAvg('engagement_score')),
    };
  } catch (error) {
    logger.error('Failed to get activity summary', error, { userId });
    throw new Error('Failed to get activity summary');
  }
}

/**
 * Calculate study streak (consecutive active days)
 * @param userId - User ID
 * @returns Streak count in days
 */
export async function calculateStudyStreak(userId: string): Promise<number> {
  try {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (streak < 365) {
      // Prevent infinite loop
      const metric = await prisma.activityMetric.findFirst({
        where: {
          userId,
          metricType: 'engagement_score',
          date: currentDate,
          period: 'daily',
          value: { gt: 0 },
        },
      });

      if (!metric) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  } catch (error) {
    logger.error('Failed to calculate study streak', error, { userId });
    return 0;
  }
}

/**
 * Get weekly activity trend data
 * @param userId - User ID
 * @returns Array of daily engagement scores for last 7 days
 */
export async function getWeeklyTrend(
  userId: string
): Promise<Array<{ date: string; score: number }>> {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const metrics = await prisma.activityMetric.findMany({
      where: {
        userId,
        metricType: 'engagement_score',
        date: { gte: weekAgo },
        period: 'daily',
      },
      orderBy: { date: 'asc' },
    });

    return metrics.map((m) => ({
      date: m.date.toISOString().split('T')[0],
      score: m.value,
    }));
  } catch (error) {
    logger.error('Failed to get weekly trend', error, { userId });
    return [];
  }
}

/**
 * Identify at-risk students (inactive for N days)
 * @param daysInactive - Number of days of inactivity
 * @returns Array of at-risk users
 */
export async function getAtRiskStudents(
  daysInactive: number = 7
): Promise<
  Array<Pick<User, 'id' | 'name' | 'email' | 'lastActiveAt'>>
> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        OR: [
          { lastActiveAt: { lt: cutoffDate } },
          { lastActiveAt: null },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
      },
      orderBy: {
        lastActiveAt: 'asc',
      },
    });

    logger.info('At-risk students identified', {
      count: students.length,
      daysInactive,
    });

    return students;
  } catch (error) {
    logger.error('Failed to get at-risk students', error);
    throw new Error('Failed to identify at-risk students');
  }
}

/**
 * Calculate metrics for all students (batch operation)
 * Should be run via cron job daily
 */
export async function calculateAllStudentMetrics(
  date: Date = new Date()
): Promise<number> {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    let successCount = 0;

    for (const student of students) {
      try {
        await calculateDailyMetrics(student.id, date);
        successCount++;
      } catch (error) {
        logger.error('Failed to calculate metrics for student', error, {
          userId: student.id,
        });
      }
    }

    logger.info('Batch metrics calculation completed', {
      total: students.length,
      successful: successCount,
      date: date.toISOString().split('T')[0],
    });

    return successCount;
  } catch (error) {
    logger.error('Failed to calculate all student metrics', error);
    return 0;
  }
}
