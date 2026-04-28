import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const LEVEL_COLORS: Record<string, string> = {
  Advanced:   'bg-green-100 text-green-800',
  Proficient: 'bg-blue-100 text-blue-800',
  Developing: 'bg-yellow-100 text-yellow-800',
  Beginner:   'bg-gray-100 text-gray-700',
};

export default async function AdminStudentsPage() {
  const roadmaps = await prisma.assessmentRoadmap.findMany({
    orderBy: { generatedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Roadmaps</h1>
        <p className="text-gray-500 mt-1">{roadmaps.length} submission{roadmaps.length !== 1 ? 's' : ''}</p>
      </div>

      {roadmaps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-lg">No roadmaps generated yet.</p>
          <p className="text-gray-400 text-sm mt-1">They will appear here once students complete the assessment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roadmaps.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{r.user.name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{r.user.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[r.level] ?? 'bg-gray-100 text-gray-700'}`}>
                      {r.level}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-800">{r.score}%</td>
                  <td className="px-5 py-4 text-gray-600">{r.totalDuration}</td>
                  <td className="px-5 py-4 text-gray-400">
                    <div>{r.generatedAt.toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
                    })}</div>
                    <div className="text-xs">
                      {r.generatedAt.toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short',
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/roadmaps/${r.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                    >
                      View roadmap →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
