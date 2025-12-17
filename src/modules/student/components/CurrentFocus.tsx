import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CurrentFocus() {
  const { t } = useLanguage();
  // TODO: Fetch student's current focus from DB (e.g. currentModuleId, currentProjectId)
  // TODO: Allow student to manually set their current focus in a future profile UI
  // TODO: Query: SELECT * FROM student_focus WHERE student_id = ? ORDER BY updated_at DESC LIMIT 1

  // Placeholder data
  const currentModule = {
    id: 'mod-001',
    title: 'Advanced React Patterns',
    description: 'Learn advanced React patterns including render props, compound components, and hooks composition.',
    progress: 65,
  };

  const currentProject = {
    id: 'proj-001',
    title: 'E-commerce Dashboard',
    description: 'Build a full-stack e-commerce admin dashboard with real-time analytics.',
    status: 'in-progress',
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.currentFocus')}</h2>
        <button className="text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium">
          {t('student.changeFocus')}
        </button>
      </div>

      <div className="space-y-4">
        {/* Current Module */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                {t('student.module')}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {currentModule.title}
              </h3>
            </div>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              {currentModule.progress}% {t('student.complete')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {currentModule.description}
          </p>
          <Link
            href={`/modules/${currentModule.id}`}
            className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {t('student.openModule')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Current Project */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/50">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                {t('student.project')}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {currentProject.title}
              </h3>
            </div>
            <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
              {t('student.inProgress')}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {currentProject.description}
          </p>
          <Link
            href={`/projects/${currentProject.id}`}
            className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            {t('student.openProject')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
