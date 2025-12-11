import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/analytics - Get platform analytics
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all Clerk users for user counts
    const client = await clerkClient();
    const allClerkUsers = await client.users.getUserList({ limit: 500 });

    const usersByRole = {
      students: 0,
      instructors: 0,
      admins: 0,
      total: allClerkUsers.totalCount,
    };

    allClerkUsers.data.forEach((user) => {
      const role = (user.publicMetadata?.role as string) || 'STUDENT';
      if (role === 'STUDENT') usersByRole.students++;
      else if (role === 'INSTRUCTOR') usersByRole.instructors++;
      else if (role === 'ADMIN') usersByRole.admins++;
    });

    // Recent users (created in last 7 and 30 days)
    const recentUsers = {
      last7Days: allClerkUsers.data.filter(
        (u) => new Date(u.createdAt) >= sevenDaysAgo
      ).length,
      last30Days: allClerkUsers.data.filter(
        (u) => new Date(u.createdAt) >= thirtyDaysAgo
      ).length,
    };

    // Course stats
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.course.count({ where: { published: false } }),
    ]);

    // Lesson stats
    const totalLessons = await prisma.lesson.count();

    // Enrollment stats
    const [totalEnrollments, activeEnrollments, completedEnrollments] = await Promise.all([
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completedAt: null } }),
      prisma.enrollment.count({ where: { completedAt: { not: null } } }),
    ]);

    // Recent enrollments
    const recentEnrollments = {
      last7Days: await prisma.enrollment.count({
        where: { enrolledAt: { gte: sevenDaysAgo } },
      }),
      last30Days: await prisma.enrollment.count({
        where: { enrolledAt: { gte: thirtyDaysAgo } },
      }),
    };

    // Assessment stats
    const attemptStats = await prisma.attempt.aggregate({
      _count: { id: true },
      _avg: { score: true },
    });

    const [passedAttempts, recentAttempts] = await Promise.all([
      prisma.attempt.count({ where: { passed: true } }),
      {
        last7Days: await prisma.attempt.count({
          where: { attemptedAt: { gte: sevenDaysAgo } },
        }),
        last30Days: await prisma.attempt.count({
          where: { attemptedAt: { gte: thirtyDaysAgo } },
        }),
      },
    ]);

    // Top enrolled courses
    const topCourses = await prisma.course.findMany({
      take: 5,
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    // Top performing students (by average score)
    const topStudents = await prisma.user.findMany({
      take: 5,
      where: {
        attempts: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
        attempts: {
          select: {
            score: true,
          },
        },
      },
    });

    // Calculate average scores for students
    const topStudentsWithAvg = topStudents
      .map((student) => {
        const avgScore =
          student.attempts.reduce((sum, att) => sum + att.score, 0) /
          student.attempts.length;
        return {
          id: student.id,
          name: student.name || 'N/A',
          email: student.email,
          attemptCount: student._count.attempts,
          avgScore: Math.round(avgScore),
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // Average enrollment progress
    const avgProgress = await prisma.enrollment.aggregate({
      _avg: { progress: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          users: usersByRole,
          courses: {
            total: totalCourses,
            published: publishedCourses,
            draft: draftCourses,
          },
          lessons: {
            total: totalLessons,
          },
          enrollments: {
            total: totalEnrollments,
            active: activeEnrollments,
            completed: completedEnrollments,
            completionRate:
              totalEnrollments > 0
                ? Math.round((completedEnrollments / totalEnrollments) * 100)
                : 0,
          },
          assessments: {
            total: attemptStats._count.id,
            avgScore: Math.round(attemptStats._avg.score || 0),
            passRate:
              attemptStats._count.id > 0
                ? Math.round((passedAttempts / attemptStats._count.id) * 100)
                : 0,
          },
        },
        trends: {
          newUsers: recentUsers,
          newEnrollments: recentEnrollments,
          recentAttempts,
          avgEnrollmentProgress: Math.round(avgProgress._avg.progress || 0),
        },
        topPerformers: {
          courses: topCourses.map((c) => ({
            id: c.id,
            title: c.title,
            instructor: c.instructor.name || 'N/A',
            enrollments: c._count.enrollments,
            published: c.published,
          })),
          students: topStudentsWithAvg,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
