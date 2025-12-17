import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProjectSummary() {
  const { t } = useLanguage();
  // TODO: Fetch project data from DB (projects, student_projects tables)
  // TODO: Query: SELECT * FROM student_projects WHERE student_id = ? AND status = 'active' LIMIT 1
  // TODO: Populate last commit via GitHub webhook logs
  // TODO: Query: SELECT timestamp FROM github_webhooks WHERE repo_url = ? ORDER BY timestamp DESC LIMIT 1
  // TODO: Replace checklist with dynamic milestones from project_milestones table

  // Placeholder data
  const project = {
    name: 'E-commerce Dashboard',
    githubRepo: 'https://github.com/username/ecommerce-dashboard',
    instructionsUrl: '/projects/proj-001/instructions',
    lastCommit: '2 hours ago',
    status: 'in-progress',
  };

  const milestones = [
    { id: 1, title: 'Setup', completed: true },
    { id: 2, title: 'Product Listing Feature', completed: true },
    { id: 3, title: 'Shopping Cart', completed: false },
    { id: 4, title: 'Checkout Flow', completed: false },
    { id: 5, title: 'Deployment', completed: false },
  ];

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.currentProject')}</h2>
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
          {project.status === 'in-progress' ? t('student.inProgress') : project.status}
        </span>
      </div>

      {/* Project Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{project.name}</h3>

        <div className="space-y-2">
          {/* GitHub Repo Link */}
          <a
            href={project.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t('student.viewRepository')}
          </a>

          {/* Instructions Link */}
          <Link
            href={project.instructionsUrl}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('student.projectInstructions')}
          </Link>

          {/* Last Commit */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('student.lastCommit')}: {project.lastCommit}
          </div>
        </div>
      </div>

      {/* Milestones Checklist */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-lg p-4 border border-gray-200 dark:border-blue-800/50">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('student.projectMilestones')}</h4>
        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                milestone.completed
                  ? 'bg-green-500 dark:bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}>
                {milestone.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${
                milestone.completed ? 'text-gray-600 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white font-medium'
              }`}>
                {milestone.title}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>{t('student.progress')}</span>
            <span className="font-semibold">
              {milestones.filter(m => m.completed).length} / {milestones.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
