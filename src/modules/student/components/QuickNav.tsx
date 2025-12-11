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
      id: 3,
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
      id: 4,
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
      id: 5,
      nameKey: 'askQuestion',
      descriptionKey: 'getSupport',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/questions/new',
      color: 'yellow',
    },
    {
      id: 6,
      nameKey: 'resources',
      descriptionKey: 'learningMaterials',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      link: '/resources',
      color: 'orange',
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
