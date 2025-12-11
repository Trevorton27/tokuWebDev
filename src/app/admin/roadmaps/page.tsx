'use client';

import Link from 'next/link';

export default function RoadmapManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Roadmap Management</h1>
              <p className="text-gray-600 mt-1">Create personalized learning paths</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">API: GET/POST /api/admin/roadmaps and GET/PUT/DELETE /api/admin/roadmaps/[roadmapId]</p>
        <div className="mt-4 text-gray-600">
          <p className="font-semibold">Roadmap Item Types:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>COURSE - Course in learning journey</li>
            <li>SKILL - Skill to develop</li>
            <li>PROJECT - Project to complete</li>
            <li>MILESTONE - Achievement milestone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
