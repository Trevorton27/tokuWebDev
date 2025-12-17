import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/students/[studentId]/assessments/[sessionId]
 * Get detailed results for a specific assessment session (admin/instructor only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { studentId: string; sessionId: string } }
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

    const { studentId, sessionId } = params;

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

    // Get the specific assessment session
    const session = await prisma.assessmentSession.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Assessment session not found' },
        { status: 404 }
      );
    }

    // Verify the session belongs to this student
    if (session.userId !== student.id) {
      return NextResponse.json(
        { success: false, error: 'This assessment does not belong to the specified student' },
        { status: 403 }
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
        id: session.id,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        averageScore,
        student: {
          id: student.id,
          email: student.email,
          name: student.name,
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

    logger.error('GET /api/admin/students/[studentId]/assessments/[sessionId] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment details' },
      { status: 500 }
    );
  }
}
