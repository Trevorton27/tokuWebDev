import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ActiveChallenges() {
  const { t } = useLanguage();
  // TODO: Replace static items with dynamic tasks from getStudentTasks(studentId)
  // TODO: Query: SELECT * FROM challenges WHERE student_id = ? AND status IN ('open', 'in_progress') ORDER BY priority DESC LIMIT 5
  // TODO: Include project checkpoints: SELECT * FROM project_checkpoints WHERE student_id = ? AND completed = false
  // TODO: Clicking task navigates to its challenge/project route

  // Placeholder data
  const tasks = [
    {
      id: 'ch-001',
      title: 'Implement Custom Hooks',
      type: 'challenge',
      difficulty: 'Medium',
      estimatedTime: '2 hours',
      status: 'in_progress',
      link: '/challenges/ch-001',
    },
    {
      id: 'ch-002',
      title: 'Build Authentication Flow',
      type: 'challenge',
      difficulty: 'Hard',
      estimatedTime: '4 hours',
      status: 'open',
      link: '/challenges/ch-002',
    },
    {
      id: 'proj-001-cp1',
      title: 'Setup Project Repository',
      type: 'project-checkpoint',
      difficulty: 'Easy',
      estimatedTime: '30 min',
      status: 'in_progress',
      link: '/projects/proj-001#checkpoint-1',
    },
    {
      id: 'ch-003',
      title: 'Optimize React Performance',
      type: 'challenge',
      difficulty: 'Medium',
      estimatedTime: '3 hours',
      status: 'open',
      link: '/challenges/ch-003',
    },
    {
      id: 'proj-001-cp2',
      title: 'Implement Product Listing',
      type: 'project-checkpoint',
      difficulty: 'Medium',
      estimatedTime: '2 hours',
      status: 'open',
      link: '/projects/proj-001#checkpoint-2',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return t('student.easy');
      case 'medium':
        return t('student.medium');
      case 'hard':
        return t('student.hard');
      default:
        return difficulty;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'project-checkpoint') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.activeTasks')}</h2>
        <Link
          href="/challenges"
          className="text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium"
        >
          {t('student.viewAll')}
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={task.link}
            className="block bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg p-4 transition-colors border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-purple-600"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`mt-0.5 ${task.status === 'in_progress' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  {getTypeIcon(task.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{task.type === 'project-checkpoint' ? t('student.projectCheckpoint') : t('student.challenge')}</span>
                    <span>•</span>
                    <span>{task.estimatedTime}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getDifficultyColor(task.difficulty)}`}>
                {getDifficultyText(task.difficulty)}
              </span>
            </div>
            {task.status === 'in_progress' && (
              <div className="mt-3 flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('student.inProgressContinue')}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
