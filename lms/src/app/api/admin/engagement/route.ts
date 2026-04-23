import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/engagement - Get student engagement analytics
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get enrollment analytics
    const enrollmentWhere: any = {};
    if (userId) enrollmentWhere.userId = userId;
    if (courseId) enrollmentWhere.courseId = courseId;
    if (Object.keys(dateFilter).length > 0) {
      enrollmentWhere.enrolledAt = dateFilter;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Get assessment attempts analytics
    const attemptWhere: any = {};
    if (userId) attemptWhere.userId = userId;
    if (Object.keys(dateFilter).length > 0) {
      attemptWhere.attemptedAt = dateFilter;
    }

    const attempts = await prisma.attempt.findMany({
      where: attemptWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: { attemptedAt: 'desc' },
      take: 100,
    });

    // Get mastery events
    const masteryWhere: any = {};
    if (userId) masteryWhere.userId = userId;
    if (Object.keys(dateFilter).length > 0) {
      masteryWhere.timestamp = dateFilter;
    }

    const masteryEvents = await prisma.masteryEvent.findMany({
      where: masteryWhere,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // Calculate summary statistics
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.completedAt).length;
    const avgProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / (totalEnrollments || 1);

    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => a.passed).length;
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / (totalAttempts || 1);
    const avgTimeSpent = attempts.reduce((sum, a) => sum + a.timeSpent, 0) / (totalAttempts || 1);

    const summary = {
      enrollments: {
        total: totalEnrollments,
        completed: completedEnrollments,
        inProgress: totalEnrollments - completedEnrollments,
        avgProgress: Math.round(avgProgress),
      },
      assessments: {
        totalAttempts,
        successfulAttempts,
        successRate: totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0,
        avgScore: Math.round(avgScore),
        avgTimeSpent: Math.round(avgTimeSpent),
      },
      mastery: {
        totalEvents: masteryEvents.length,
        eventsByType: {
          ATTEMPT: masteryEvents.filter(e => e.event === 'ATTEMPT').length,
          SUCCESS: masteryEvents.filter(e => e.event === 'SUCCESS').length,
          FAILURE: masteryEvents.filter(e => e.event === 'FAILURE').length,
          HINT: masteryEvents.filter(e => e.event === 'HINT').length,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        summary,
        enrollments,
        attempts,
        masteryEvents,
      },
    });
  } catch (error: any) {
    console.error('Error fetching engagement data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch engagement data' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
