import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { editRoadmapWithAI } from '@/server/assessment/roadmapService';
import type { RoadmapPhase, RoadmapProject, GeneratedRoadmap } from '@/server/assessment/roadmapService';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireAdmin();
  const user = await currentUser();
  const adminName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Admin';

  const { instruction } = await req.json();
  if (!instruction?.trim()) {
    return NextResponse.json({ error: 'instruction is required' }, { status: 400 });
  }

  const roadmap = await prisma.assessmentRoadmap.findUnique({
    where: { id: params.id },
  });
  if (!roadmap) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const current: GeneratedRoadmap = {
    summary: roadmap.summary,
    totalDuration: roadmap.totalDuration,
    firstStep: roadmap.firstStep,
    phases: roadmap.phases as unknown as RoadmapPhase[],
    projects: roadmap.projects as unknown as RoadmapProject[],
  };

  const updated = await editRoadmapWithAI(current, instruction);
  if (!updated) {
    return NextResponse.json({ error: 'AI edit failed' }, { status: 500 });
  }

  // Determine next version number
  const lastVersion = await prisma.assessmentRoadmapVersion.findFirst({
    where: { roadmapId: params.id },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  // Snapshot current state as a version, then update roadmap
  await prisma.$transaction([
    prisma.assessmentRoadmapVersion.create({
      data: {
        roadmapId: params.id,
        version: nextVersion,
        editedBy: adminName,
        editNote: instruction,
        summary: roadmap.summary,
        totalDuration: roadmap.totalDuration,
        firstStep: roadmap.firstStep,
        phases: roadmap.phases as any,
        projects: roadmap.projects as any,
      },
    }),
    prisma.assessmentRoadmap.update({
      where: { id: params.id },
      data: {
        summary: updated.summary,
        totalDuration: updated.totalDuration,
        firstStep: updated.firstStep,
        phases: updated.phases as any,
        projects: updated.projects as any,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
