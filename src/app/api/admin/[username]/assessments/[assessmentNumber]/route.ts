import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/[username]/assessments/[assessmentNumber]
 * Get detailed results for a specific assessment by number (admin/instructor only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string; assessmentNumber: string } }
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

    const { username, assessmentNumber } = params;
    const number = parseInt(assessmentNumber, 10);

    if (isNaN(number) || number < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid assessment number' },
        { status: 400 }
      );
    }

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

    // Get all sessions ordered by completion to find the Nth one
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        userId: student.id,
        sessionType: 'INTAKE',
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Get the specific session by index (assessment number - 1)
    const session = sessions[number - 1];

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get all responses for this session
    const responses = await prisma.assessmentResponse.findMany({
      where: { sessionId: session.id },
      orderBy: { id: 'asc' },
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

    const averageScore = scoredSteps > 0 ? Math.round((totalScore / scoredSteps) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        assessmentNumber: number,
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        averageScore,
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
          username: student.name || student.email.split('@')[0],
        },
        responses: responses.map((r) => ({
          stepId: r.stepId,
          stepKind: r.stepKind,
          rawAnswer: r.rawAnswer,
          gradeResult: r.gradeResult,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/admin/[username]/assessments/[assessmentNumber] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment details' },
      { status: 500 }
    );
  }
}
