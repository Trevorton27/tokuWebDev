import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/students/[studentId]/overview
 * Returns full student dashboard data for admin view.
 * studentId = Clerk user ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireRole(['ADMIN']);

    const { studentId } = await params;

    // Resolve Clerk ID → DB user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: studentId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminNotes: true,
        roadmapDocumentId: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    const dbId = dbUser.id;

    // Fetch all data in parallel
    const [enrollment, assessmentSessions, roadmap, skills] = await Promise.all([
      // Most recent enrollment
      prisma.enrollment.findFirst({
        where: { userId: dbId },
        orderBy: { enrolledAt: 'desc' },
        include: { course: { select: { title: true } } },
      }),

      // Assessment sessions with response counts
      prisma.assessmentSession.findMany({
        where: { userId: dbId, sessionType: 'INTAKE' },
        include: { _count: { select: { responses: true } } },
        orderBy: { startedAt: 'desc' },
      }),

      // Roadmap items
      prisma.studentRoadmap.findMany({
        where: { userId: dbId },
        orderBy: [{ phase: 'asc' }, { order: 'asc' }],
        select: {
          id: true,
          title: true,
          description: true,
          itemType: true,
          status: true,
          phase: true,
          order: true,
          estimatedHours: true,
        },
      }),

      // Skill masteries
      prisma.userSkillMastery.findMany({
        where: { userId: dbId },
        orderBy: { mastery: 'desc' },
        select: {
          skillKey: true,
          mastery: true,
          confidence: true,
          attempts: true,
        },
      }),
    ]);

    // Score assessment sessions
    const sessionsWithScores = await Promise.all(
      assessmentSessions.map(async (session, index) => {
        const responses = await prisma.assessmentResponse.findMany({
          where: { sessionId: session.id },
          select: { gradeResult: true },
        });
        let total = 0;
        let count = 0;
        for (const r of responses) {
          const g = r.gradeResult as any;
          if (g?.score !== undefined) { total += g.score; count++; }
        }
        return {
          assessmentNumber: assessmentSessions.length - index,
          id: session.id,
          status: session.status,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt?.toISOString() ?? null,
          responseCount: session._count.responses,
          averageScore: count > 0 ? Math.round((total / count) * 100) : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        student: {
          dbId,
          clerkId: studentId,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          adminNotes: dbUser.adminNotes,
          roadmapDocumentId: dbUser.roadmapDocumentId,
        },
        enrollment: enrollment ? {
          id: enrollment.id,
          courseTitle: enrollment.course.title,
          startDate: enrollment.enrolledAt.toISOString(),
          finishDate: enrollment.completedAt?.toISOString() ?? null,
          progress: enrollment.progress,
        } : null,
        sessions: sessionsWithScores,
        roadmap,
        skills,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch student overview' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
