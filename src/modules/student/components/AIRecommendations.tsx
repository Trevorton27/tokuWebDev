import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AIRecommendations() {
  const { t } = useLanguage();
  // TODO: Fetch from AI microservice /ai/recommendations?studentId=...
  // TODO: Wire mastery scores from DB into AI prompt
  // TODO: Query: SELECT topic, mastery_score FROM topic_mastery WHERE student_id = ? AND mastery_score < 0.7
  // TODO: Include recent challenge performance in AI context
  // TODO: Query: SELECT * FROM challenge_attempts WHERE student_id = ? ORDER BY completed_at DESC LIMIT 10
  // TODO: Add refresh button to regenerate recommendations

  // Placeholder data
  const recommendations = [
    {
      id: 1,
      type: 'review',
      icon: '📚',
      titleKey: 'review',
      title: 'Array Methods',
      description: 'Your recent challenges show room for improvement with map, filter, and reduce.',
      actionKey: 'reviewTopic',
      link: '/topics/array-methods',
      color: 'yellow',
    },
    {
      id: 2,
      type: 'challenge',
      icon: '⚡',
      titleKey: 'try',
      title: 'Async/Await Challenge',
      description: 'Based on your progress, you\'re ready to tackle asynchronous JavaScript patterns.',
      actionKey: 'startChallenge',
      link: '/challenges/async-await',
      color: 'blue',
    },
    {
      id: 3,
      type: 'milestone',
      icon: '🎯',
      titleKey: 'readyFor',
      title: 'Project Milestone 3',
      description: 'You\'ve mastered the prerequisites. Time to implement the shopping cart feature!',
      actionKey: 'viewMilestone',
      link: '/projects/proj-001#milestone-3',
      color: 'green',
    },
    {
      id: 4,
      type: 'concept',
      icon: '💡',
      titleKey: 'strengthen',
      title: 'State Management',
      description: 'Consider reviewing Redux or Context API before moving to advanced patterns.',
      actionKey: 'learnMore',
      link: '/topics/state-management',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
      case 'blue':
        return 'bg-blue-50 border-blue-200 hover:border-blue-300';
      case 'green':
        return 'bg-green-50 border-green-200 hover:border-green-300';
      case 'purple':
        return 'bg-purple-50 border-purple-200 hover:border-purple-300';
      default:
        return 'bg-gray-50 border-gray-200 hover:border-gray-300';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'text-yellow-700';
      case 'blue':
        return 'text-blue-700';
      case 'green':
        return 'text-green-700';
      case 'purple':
        return 'text-purple-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.aiRecommendations')}</h2>
        </div>
        <button className="text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium">
          {t('student.refresh')}
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={rec.link}
            className={`block rounded-lg p-4 border transition-all ${getColorClasses(rec.color)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {t(`student.${rec.titleKey}`)}: {rec.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {rec.description}
                </p>
                <span className={`inline-flex items-center text-xs font-semibold ${getTextColor(rec.color)}`}>
                  {t(`student.${rec.actionKey}`)}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* AI Badge */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('student.aiPowered')}
        </p>
      </div>
    </div>
  );
}
