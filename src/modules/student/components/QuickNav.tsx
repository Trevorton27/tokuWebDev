import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function QuickNav() {
  const { t } = useLanguage();
  // TODO: Route to actual Next.js pages
  // TODO: Add role-based visibility if instructors also use a similar dashboard template
  // TODO: Track click analytics to see which shortcuts are most used
  // TODO: Allow students to customize which shortcuts appear (save in user preferences)

  const shortcuts = [
    {
      id: 1,
      nameKey: 'roadmap',
      descriptionKey: 'viewLearningPath',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      link: '/student/roadmap',
      color: 'indigo',
    },
    {
      id: 2,
      nameKey: 'skillProfile',
      descriptionKey: 'viewSkillProfile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      link: '/student/skills',
      color: 'teal',
    },
    {
      id: 3,
      nameKey: 'allChallenges',
      descriptionKey: 'browseChallenges',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      link: '/challenges',
      color: 'blue',
    },
    {
      id: 4,
      nameKey: 'allProjects',
      descriptionKey: 'viewPortfolio',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      link: '/projects',
      color: 'green',
    },
    {
      id: 5,
      nameKey: 'aiTutor',
      descriptionKey: 'getHelp',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      link: '/ai-tutor',
      color: 'purple',
    },
    {
      id: 6,
      nameKey: 'takeAssessment',
      descriptionKey: 'assessSkills',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      link: '/assessment/intake',
      color: 'pink',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      indigo: 'bg-indigo-500 group-hover:bg-indigo-600',
      blue: 'bg-blue-500 group-hover:bg-blue-600',
      green: 'bg-green-500 group-hover:bg-green-600',
      purple: 'bg-purple-500 group-hover:bg-purple-600',
      yellow: 'bg-yellow-500 group-hover:bg-yellow-600',
      orange: 'bg-orange-500 group-hover:bg-orange-600',
      teal: 'bg-teal-500 group-hover:bg-teal-600',
      pink: 'bg-pink-500 group-hover:bg-pink-600',
    };
    return colors[color] || 'bg-gray-500 group-hover:bg-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t('student.quickActions')}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.id}
            href={shortcut.link}
            className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-md"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-white transition-colors ${getColorClasses(shortcut.color)}`}>
              {shortcut.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {t(`student.${shortcut.nameKey}`)}
            </h3>
            <p className="text-xs text-gray-500">
              {t(`student.${shortcut.descriptionKey}`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
