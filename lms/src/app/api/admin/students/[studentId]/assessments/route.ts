import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/students/[studentId]/assessments
 * Get all assessment sessions for a specific student (admin only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { studentId: string } }
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

    const { studentId } = params;

    // Get student info - support both internal ID and Clerk ID
    let student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // If not found by ID, try Clerk ID
    if (!student) {
      student = await prisma.user.findUnique({
        where: { clerkId: studentId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Get all assessment sessions with response count (use student.id, not studentId param)
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
        completedAt: 'desc',
      },
    });

    // Calculate scores for each session
    const sessionsWithScores = await Promise.all(
      sessions.map(async (session) => {
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
          id: session.id,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          responseCount: session._count.responses,
          averageScore: Math.round(averageScore * 100), // Convert to percentage
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

    logger.error('GET /api/admin/students/[studentId]/assessments failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment sessions' },
      { status: 500 }
    );
  }
}
