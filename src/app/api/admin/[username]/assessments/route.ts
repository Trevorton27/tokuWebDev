import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/[username]/assessments
 * Get all assessment sessions for a specific student by username (admin/instructor only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await requireAuth();

    // Check if user is admin or instructor
    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin or Instructor access required' },
        { status: 403 }
      );
    }

    const { username } = params;

    // Get student by username (name field) or email prefix
    let student = await prisma.user.findFirst({
      where: {
        OR: [
          { name: username },
          { email: { startsWith: username } },
        ],
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get all assessment sessions with response count
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        userId: student.id,
        sessionType: 'INTAKE',
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc', // Order by completion time for numbering
      },
    });

    // Calculate scores and assign numbers
    const sessionsWithScores = await Promise.all(
      sessions.map(async (session, index) => {
        // Get all responses for this session
        const responses = await prisma.assessmentResponse.findMany({
          where: { sessionId: session.id },
        });

        // Calculate average score
        let totalScore = 0;
        let scoredSteps = 0;

        for (const response of responses) {
          const gradeResult = response.gradeResult as any;
          if (gradeResult?.score !== undefined) {
            totalScore += gradeResult.score;
            scoredSteps++;
          }
        }

        const averageScore = scoredSteps > 0 ? totalScore / scoredSteps : 0;

        return {
          assessmentNumber: index + 1, // 1-based numbering
          id: session.id,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          responseCount: session._count.responses,
          averageScore: Math.round(averageScore * 100),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
          username: student.name || student.email.split('@')[0],
        },
        sessions: sessionsWithScores,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/admin/[username]/assessments failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment sessions' },
      { status: 500 }
    );
  }
}
