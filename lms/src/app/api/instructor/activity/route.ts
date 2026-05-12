/**
 * Instructor Activity API
 * Get cohort-wide student activity for instructors
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    await requireRole(['INSTRUCTOR', 'ADMIN']);

    // Get all students with their latest metrics
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
        activityMetrics: {
          where: {
            period: 'daily',
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    const studentActivity = students.map((student) => {
      // Aggregate metrics
      const metrics = {
        engagementScore: 0,
        loginCount: 0,
        sessionDuration: 0,
        githubCommits: 0,
        attempts: 0,
      };

      student.activityMetrics.forEach((m) => {
        switch (m.metricType) {
          case 'engagement_score':
            metrics.engagementScore = Math.max(
              metrics.engagementScore,
              m.value
            );
            break;
          case 'login_count':
            metrics.loginCount += m.value;
            break;
          case 'session_duration':
            metrics.sessionDuration += m.value;
            break;
          case 'github_commits':
            metrics.githubCommits += m.value;
            break;
          case 'challenge_attempts':
            metrics.attempts += m.value;
            break;
        }
      });

      // Calculate days since last active
      const daysSinceActive = student.lastActiveAt
        ? Math.floor(
            (Date.now() - student.lastActiveAt.getTime()) /
              (24 * 60 * 60 * 1000)
          )
        : 999;

      // Determine status
      let status: 'active' | 'inactive' | 'at-risk';
      if (daysSinceActive > 7) {
        status = 'at-risk';
      } else if (daysSinceActive > 3) {
        status = 'inactive';
      } else {
        status = 'active';
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        lastActiveAt: student.lastActiveAt,
        engagementScore: Math.round(metrics.engagementScore),
        weeklyMetrics: {
          logins: metrics.loginCount,
          sessionTime: Math.round(metrics.sessionDuration),
          commits: metrics.githubCommits,
          attempts: metrics.attempts,
        },
        status,
      };
    });

    return NextResponse.json({
      success: true,
      data: studentActivity,
    });
  } catch (error) {
    logger.error('GET /api/instructor/activity failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch student activity' },
      { status: 500 }
    );
  }
}
