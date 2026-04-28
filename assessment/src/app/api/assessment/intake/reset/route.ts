import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * DELETE /api/assessment/intake/reset
 * Dev-only: deletes all intake sessions for the current user so they can restart.
 */
export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const user = await requireAuth();

  const sessions = await prisma.assessmentSession.findMany({
    where: { userId: user.id, sessionType: 'INTAKE' },
    select: { id: true },
  });

  const sessionIds = sessions.map((s) => s.id);

  // Delete in dependency order
  await prisma.assessmentRoadmap.deleteMany({ where: { sessionId: { in: sessionIds } } });
  await prisma.assessmentResponse.deleteMany({ where: { sessionId: { in: sessionIds } } });
  await prisma.assessmentSession.deleteMany({ where: { id: { in: sessionIds } } });

  // Clear accumulated skill masteries so the next run starts from a clean slate
  await prisma.userSkillMastery.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ success: true, deleted: sessionIds.length });
}
