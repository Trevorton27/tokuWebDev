'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectSummary() {
  const { t } = useLanguage();

  // Fetch current project from API
  const { data, error, isLoading } = useSWR('/api/student/current-project', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border-2 border-blue-100 dark:border-blue-900/30">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border-2 border-red-100 dark:border-red-900/30">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{t('student.failedToLoadProject')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            {t('student.retry')}
          </button>
        </div>
      </div>
    );
  }

  const project = data.project;

  // No current project set
  if (!project) {
    return (
      <div className="h-full bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border flex flex-col justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('student.noActiveProject')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('student.startNewProject')}
          </p>
          <Link
            href="/student/github"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('student.configureGitHub')}
          </Link>
        </div>
      </div>
    );
  }

  const milestones = project.milestones || [];

  // Format status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', label: t('student.inProgress') },
      NOT_STARTED: { bg: 'bg-gray-100 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', label: t('student.notStarted') },
      BLOCKED: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', label: t('student.blocked') },
      COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300', label: t('student.completed') },
      ARCHIVED: { bg: 'bg-gray-100 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', label: t('student.archived') },
    };
    return statusMap[status] || statusMap.IN_PROGRESS;
  };

  const statusBadge = getStatusBadge(project.status);

  return (
    <div className="h-full bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border hover:border-blue-200 dark:hover:border-blue-800/40 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('student.currentProject')}</h2>
        <span className={`${statusBadge.bg} ${statusBadge.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Project Info */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h3>

        <div className="space-y-2">
          {/* GitHub Repo Link */}
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t('student.viewRepository')}
          </a>

          {/* Project Description */}
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Last Commit */}
          {project.lastCommitDate && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('student.lastCommit')}: {formatDistanceToNow(new Date(project.lastCommitDate))} {t('student.ago')}
            </div>
          )}

          {/* Commit Message */}
          {project.lastCommitMsg && (
            <div className="text-xs text-gray-500 dark:text-gray-500 italic truncate">
              &quot;{project.lastCommitMsg}&quot;
            </div>
          )}

          {/* GitHub Stats */}
          <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
            {project.totalCommits > 0 && (
              <span>{project.totalCommits} {t('student.commitsCount')}</span>
            )}
            {project.openPRs > 0 && (
              <span>{project.openPRs} {t('student.openPRsCount')}</span>
            )}
            {project.closedPRs > 0 && (
              <span>{project.closedPRs} {t('student.mergedPRsCount')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Milestones Checklist */}
      <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-5 border border-gray-200 dark:border-gray-800/50">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t('student.projectMilestones')}</h4>

        {milestones.length > 0 ? (
          <>
            <div className="space-y-2.5">
              {milestones.map((milestone: any) => (
                <div key={milestone.id} className="flex items-center">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${milestone.completed
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                    }`}>
                    {milestone.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${milestone.completed ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white font-medium'
                      }`}>
                      {milestone.title}
                    </span>
                    {milestone.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
                <span>{t('student.progress')}</span>
                <span className="font-semibold">
                  {project.stats?.completedMilestones || 0} / {project.stats?.totalMilestones || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.stats?.progress || 0}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            {t('student.noMilestones')}
            <Link
              href="/student/projects"
              className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
            >
              {t('student.addMilestones')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
