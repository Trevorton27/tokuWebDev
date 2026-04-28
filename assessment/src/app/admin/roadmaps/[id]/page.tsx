import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { RoadmapPhase, RoadmapProject } from '@/server/assessment/roadmapService';

export const dynamic = 'force-dynamic';

const LEVEL_COLORS: Record<string, string> = {
  Advanced:   'bg-green-100 text-green-800',
  Proficient: 'bg-blue-100 text-blue-800',
  Developing: 'bg-yellow-100 text-yellow-800',
  Beginner:   'bg-gray-100 text-gray-700',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner:     'bg-green-50 text-green-700 border-green-200',
  Intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Advanced:     'bg-red-50 text-red-700 border-red-200',
};

export default async function RoadmapDetailPage({ params }: { params: { id: string } }) {
  const roadmap = await prisma.assessmentRoadmap.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!roadmap) notFound();

  const phases = roadmap.phases as RoadmapPhase[];
  const projects = roadmap.projects as RoadmapProject[];

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition mb-6 inline-block">
        ← All students
      </Link>

      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 text-white mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{roadmap.user.name ?? 'Student'}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{roadmap.user.email}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[roadmap.level] ?? 'bg-gray-100 text-gray-700'}`}>
              {roadmap.level}
            </span>
            <div className="text-2xl font-bold mt-1">{roadmap.score}%</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Duration</div>
            <div className="text-gray-100">{roadmap.totalDuration}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Generated</div>
            <div className="text-gray-100">
              {roadmap.generatedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</h2>
        <p className="text-gray-800 leading-relaxed">{roadmap.summary}</p>
      </div>

      {/* First Step */}
      <div className="bg-indigo-600 rounded-xl p-5 mb-8">
        <div className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-1">First Step</div>
        <p className="text-white font-medium">{roadmap.firstStep}</p>
      </div>

      {/* Phases */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Learning Phases</h2>
      <div className="space-y-4 mb-10">
        {phases.map((phase, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm">
                Phase {i + 1}: {phase.phase}
              </span>
              <span className="text-xs text-gray-400">{phase.duration}</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Focus  </span>
                <span className="text-sm text-gray-700">{phase.focus}</span>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Goals</div>
                <ul className="space-y-1">
                  {phase.goals.map((g, j) => (
                    <li key={j} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-indigo-400 shrink-0">•</span> {g}
                    </li>
                  ))}
                </ul>
              </div>

              {phase.suggestedResources?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Resources</div>
                  <ul className="space-y-1">
                    {phase.suggestedResources.map((r, j) => (
                      <li key={j} className="text-sm text-indigo-600 flex gap-2">
                        <span className="shrink-0">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {phase.capstoneProject && (
                <div className="bg-indigo-50 rounded-lg px-4 py-3">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Phase Project  </span>
                  <span className="text-sm text-indigo-900">{phase.capstoneProject}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      {projects?.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Projects to Build</h2>
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden ${project.isCapstone ? 'border-indigo-300' : 'border-gray-200'}`}
              >
                <div className={`px-5 py-3 flex items-center justify-between ${project.isCapstone ? 'bg-indigo-600' : 'bg-gray-50 border-b border-gray-100'}`}>
                  <span className={`font-semibold text-sm ${project.isCapstone ? 'text-white' : 'text-gray-900'}`}>
                    Project {i + 1}: {project.title}
                    {project.isCapstone && (
                      <span className="ml-2 text-xs font-normal bg-indigo-500 text-indigo-100 px-2 py-0.5 rounded-full">
                        Capstone
                      </span>
                    )}
                  </span>
                  <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${project.isCapstone ? 'bg-indigo-500 text-indigo-100 border-indigo-400' : DIFFICULTY_COLORS[project.difficulty] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {project.difficulty}
                  </span>
                </div>
                <div className="bg-white px-5 py-4 space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                  {project.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.map((skill, j) => (
                        <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
