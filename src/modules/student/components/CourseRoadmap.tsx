/**
 * Course Roadmap Component
 * Links to document outlining the student's complete course roadmap
 */

'use client';

import Link from 'next/link';

export default function CourseRoadmap() {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border h-[580px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Course Roadmap</span>
        </h2>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        {/* Roadmap Overview */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">🗺️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                Your Learning Path
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Complete course curriculum and learning objectives
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Sections Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Web Fundamentals</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">React & TypeScript</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Next.js & Full-Stack</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Deployment & Production</span>
          </div>
        </div>

        {/* View Full Roadmap Button */}
        <Link
          href="/roadmap"
          className="block w-full mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-medium rounded-lg transition-colors"
        >
          View Full Roadmap →
        </Link>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 The roadmap outlines your entire learning journey, milestones, and key objectives
          </p>
        </div>
      </div>
    </div>
  );
}
