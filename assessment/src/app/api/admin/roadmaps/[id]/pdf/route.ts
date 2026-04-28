import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { generateRoadmapPdf } from '@/server/assessment/roadmapPdf';
import type { RoadmapPhase, RoadmapProject } from '@/server/assessment/roadmapService';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  const roadmap = await prisma.assessmentRoadmap.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!roadmap) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const phases = roadmap.phases as unknown as RoadmapPhase[];
  const projects = roadmap.projects as unknown as RoadmapProject[];

  const pdf = await generateRoadmapPdf(roadmap.user.name ?? 'Student', {
    summary: roadmap.summary,
    totalDuration: roadmap.totalDuration,
    firstStep: roadmap.firstStep,
    phases,
    projects,
  });

  const filename = `roadmap-${(roadmap.user.name ?? 'student').toLowerCase().replace(/\s+/g, '-')}.pdf`;

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
