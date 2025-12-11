import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RoadmapProgress() {
  const { t } = useLanguage();
  // TODO: Fetch progress dynamically from /api/progress or Prisma query
  // TODO: Query: SELECT course_progress, module_progress FROM student_progress WHERE student_id = ?
  // TODO: Update when GitHub webhook triggers or challenges are completed
  // TODO: Add link to full roadmap page (/student/roadmap)

  // Placeholder data
  const overallProgress = 42;
  const currentModuleProgress = 65;
  const totalModules = 12;
  const completedModules = 5;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('student.learningProgress')}</h2>
        <Link
          href="/student/roadmap"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t('student.viewFullRoadmap')}
        </Link>
      </div>

      {/* Overall Course Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{t('student.overallProgress')}</span>
          <span className="text-2xl font-bold text-indigo-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {completedModules} {t('student.of')} {totalModules} {t('student.modulesCompleted')}
        </p>
      </div>

      {/* Current Module Progress */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">{t('student.currentModule')}</span>
          <span className="text-lg font-bold text-indigo-600">{currentModuleProgress}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${currentModuleProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Advanced React Patterns - {t('student.keepGoing')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{completedModules}</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.modules')}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">23</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.challenges')}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.projects')}</div>
        </div>
      </div>
    </div>
  );
}
