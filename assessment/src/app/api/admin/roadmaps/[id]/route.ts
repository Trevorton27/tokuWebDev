import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * DELETE /api/admin/roadmaps/[id]
 * Admin-only: deletes a student's roadmap, their assessment session (+ responses via cascade),
 * and their accumulated skill masteries so they can retake the assessment from scratch.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const roadmap = await prisma.assessmentRoadmap.findUnique({
    where: { id: params.id },
    select: { id: true, sessionId: true, userId: true },
  });

  if (!roadmap) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete skill masteries first (no cascade from session)
  await prisma.userSkillMastery.deleteMany({ where: { userId: roadmap.userId } });

  // Deleting the session cascades to AssessmentResponse and AssessmentRoadmap
  await prisma.assessmentSession.delete({ where: { id: roadmap.sessionId } });

  logger.info('admin: deleted roadmap and reset student', { roadmapId: params.id, userId: roadmap.userId });
  return NextResponse.json({ success: true });
}
