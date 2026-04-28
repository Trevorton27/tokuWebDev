import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();

  const versions = await prisma.assessmentRoadmapVersion.findMany({
    where: { roadmapId: params.id },
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      editedAt: true,
      editedBy: true,
      editNote: true,
    },
  });

  return NextResponse.json({ versions });
}
