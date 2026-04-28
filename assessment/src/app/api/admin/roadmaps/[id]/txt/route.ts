import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
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

  const generatedDate = roadmap.generatedAt.toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC', timeZoneName: 'short',
  });

  const lines: string[] = [];

  const hr = (char = '─', width = 60) => char.repeat(width);

  lines.push('PERSONALIZED LEARNING ROADMAP');
  lines.push('Signal Works Design');
  lines.push(hr());
  lines.push('');
  lines.push(`Student : ${roadmap.user.name ?? 'Unknown'}`);
  lines.push(`Email   : ${roadmap.user.email}`);
  lines.push(`Level   : ${roadmap.level}`);
  lines.push(`Score   : ${roadmap.score}%`);
  lines.push(`Duration: ${roadmap.totalDuration}`);
  lines.push(`Generated: ${generatedDate}`);
  lines.push('');
  lines.push(hr());
  lines.push('SUMMARY');
  lines.push(hr());
  lines.push(roadmap.summary);
  lines.push('');
  lines.push(hr());
  lines.push('FIRST STEP');
  lines.push(hr());
  lines.push(roadmap.firstStep);
  lines.push('');

  lines.push(hr());
  lines.push('LEARNING PHASES');
  lines.push(hr());
  lines.push('');

  phases.forEach((phase, i) => {
    lines.push(`Phase ${i + 1}: ${phase.phase}  [${phase.duration}]`);
    lines.push(hr('─', 40));
    lines.push(`Focus: ${phase.focus}`);
    lines.push('');
    lines.push('Goals:');
    phase.goals.forEach((g) => lines.push(`  • ${g}`));

    if (phase.suggestedResources?.length) {
      lines.push('');
      lines.push('Resources:');
      phase.suggestedResources.forEach((r) => lines.push(`  • ${r}`));
    }

    if (phase.capstoneProject) {
      lines.push('');
      lines.push(`Phase Project: ${phase.capstoneProject}`);
    }

    lines.push('');
  });

  if (projects?.length) {
    lines.push(hr());
    lines.push('PROJECTS TO BUILD');
    lines.push(hr());
    lines.push('');

    projects.forEach((project, i) => {
      const label = project.isCapstone ? ` [${project.difficulty} · Capstone]` : ` [${project.difficulty}]`;
      lines.push(`Project ${i + 1}: ${project.title}${label}`);
      lines.push(hr('─', 40));
      lines.push(project.description);

      if (project.skills?.length) {
        lines.push('');
        lines.push(`Skills: ${project.skills.join(' · ')}`);
      }

      lines.push('');
    });
  }

  lines.push(hr());
  lines.push('Signal Works Design  ·  support@signalworksdesign.com');

  const text = lines.join('\n');
  const filename = `roadmap-${(roadmap.user.name ?? 'student').toLowerCase().replace(/\s+/g, '-')}.txt`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
