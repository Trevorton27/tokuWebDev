import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CalendarEvents() {
  const { t } = useLanguage();
  // TODO: Integrate with Google Calendar API + student's timezone
  // TODO: Fetch events from calendar_events table WHERE student_id = ? AND date >= NOW()
  // TODO: Add "Join Zoom" buttons for relevant events (store zoom_link in DB)
  // TODO: Convert event times to student's local timezone

  // Placeholder data
  const events = [
    {
      id: 1,
      type: 'qaSession',
      title: 'React Hooks Deep Dive',
      date: 'Tomorrow',
      time: '3:00 PM EST',
      zoomLink: 'https://zoom.us/j/123456789',
      color: 'blue',
    },
    {
      id: 2,
      type: 'deadline',
      title: 'Submit E-commerce Dashboard',
      date: 'Dec 15',
      time: '11:59 PM EST',
      zoomLink: null,
      color: 'red',
    },
    {
      id: 3,
      type: 'liveCoding',
      title: 'Building a Real-time Chat App',
      date: 'Dec 18',
      time: '2:00 PM EST',
      zoomLink: 'https://zoom.us/j/987654321',
      color: 'purple',
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'qaSession':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'deadline':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'liveCoding':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'qaSession':
        return t('student.qaSession');
      case 'deadline':
        return t('student.deadline');
      case 'liveCoding':
        return t('student.liveCoding');
      default:
        return type;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'red':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'purple':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('student.upcomingEvents')}</h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          {t('student.viewCalendar')}
        </button>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg p-4 border ${getColorClasses(event.color)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span>{event.date === 'Tomorrow' ? t('student.tomorrow') : event.date}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              {event.zoomLink && (
                <a
                  href={event.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center text-xs font-semibold hover:underline"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('student.joinZoom')}
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500">{t('student.noUpcomingEvents')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('student.selfPacedCourse')}</p>
        </div>
      )}
    </div>
  );
}
