import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StudyStreak() {
  const { t } = useLanguage();
  // TODO: Pull from analytics tables (study_sessions, challenge_attempts)
  // TODO: Query: Calculate streak from study_sessions WHERE student_id = ? AND date >= (current_date - 30)
  // TODO: Implement streak rules (active day = ≥ X min learning)
  // TODO: Query: SELECT COUNT(*) FROM challenge_attempts WHERE student_id = ? AND completed = true AND week = CURRENT_WEEK
  // TODO: Query: SUM(duration) FROM study_sessions WHERE student_id = ? AND week = CURRENT_WEEK
  // TODO: Add trend graph later (weekly comparison)

  // Placeholder data
  const streak = 7;
  const challengesThisWeek = 5;
  const hoursThisWeek = 12.5;
  const weeklyGoal = 15;

  const progressPercent = (hoursThisWeek / weeklyGoal) * 100;

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('student.yourProgress')}</h2>

      {/* Streak */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800/50 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{streak} {t('student.days')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('student.studyStreak')}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase">{t('student.keepItUp')}</div>
          </div>
        </div>
      </div>

      {/* This Week Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/50">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{challengesThisWeek}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">{t('student.challengesCompleted')}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/50">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{hoursThisWeek}h</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">{t('student.hoursThisWeek')}</div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('student.weeklyGoal')}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {hoursThisWeek} / {weeklyGoal} {t('student.hours')}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {progressPercent >= 100
            ? t('student.goalAchieved')
            : `${(weeklyGoal - hoursThisWeek).toFixed(1)} ${t('student.hoursToGoal')}`
          }
        </p>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800/50">
        <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium text-center">
          {streak >= 7
            ? t('student.streakMotivation').replace('{days}', streak.toString())
            : t('student.streakEncouragement')
          }
        </p>
      </div>
    </div>
  );
}
