import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  _req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  await requireAdmin();
  const user = await currentUser();
  const adminName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Admin';

  const [roadmap, version] = await Promise.all([
    prisma.assessmentRoadmap.findUnique({ where: { id: params.id } }),
    prisma.assessmentRoadmapVersion.findUnique({ where: { id: params.versionId } }),
  ]);

  if (!roadmap || !version || version.roadmapId !== params.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const lastVersion = await prisma.assessmentRoadmapVersion.findFirst({
    where: { roadmapId: params.id },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (lastVersion?.version ?? 0) + 1;

  // Snapshot current state before restoring
  await prisma.$transaction([
    prisma.assessmentRoadmapVersion.create({
      data: {
        roadmapId: params.id,
        version: nextVersion,
        editedBy: adminName,
        editNote: `Restored to version ${version.version}`,
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
        summary: version.summary,
        totalDuration: version.totalDuration,
        firstStep: version.firstStep,
        phases: version.phases as any,
        projects: version.projects as any,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
