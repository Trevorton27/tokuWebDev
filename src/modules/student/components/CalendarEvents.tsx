'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  eventType: string;
  visibility: string;
  isAllDay: boolean;
  course?: {
    id: string;
    title: string;
  };
}

export default function CalendarEvents() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const endDate = addDays(now, 7); // Get events for next 7 days

      const response = await axios.get('/api/calendar/events', {
        params: {
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      if (response.data.success) {
        // Sort by start time and take first 3
        const sortedEvents = response.data.events
          .sort(
            (a: CalendarEvent, b: CalendarEvent) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          .slice(0, 3);

        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'QA_SESSION':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'DEADLINE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'LIVE_CODING':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'MEETING':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MEETING: 'Meeting',
      DEADLINE: 'Deadline',
      LIVE_CODING: 'Live Coding',
      QA_SESSION: 'Q&A Session',
      WORKSHOP: 'Workshop',
      STUDY_TIME: 'Study Time',
      EXAM: 'Exam',
      HOLIDAY: 'Holiday',
      OTHER: 'Event',
    };
    return labels[type] || type;
  };

  const getColorClasses = (type: string) => {
    const colors: Record<string, string> = {
      MEETING: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      DEADLINE: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      LIVE_CODING: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      QA_SESSION: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      WORKSHOP: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      STUDY_TIME: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
      EXAM: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700',
      HOLIDAY: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800',
      OTHER: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    };
    return colors[type] || colors.OTHER;
  };

  const formatEventTime = (startTime: string) => {
    const date = new Date(startTime);
    if (isToday(date)) return t('student.today');
    if (isTomorrow(date)) return t('student.tomorrow');
    return format(date, 'MMM d');
  };

  const formatTime = (startTime: string) => {
    return format(new Date(startTime), 'h:mm a');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('student.upcomingEvents')}</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('student.upcomingEvents')}</h2>
        <Link href="/student/calendar" className="text-sm text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium">
          {t('student.viewCalendar')}
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg p-4 border ${getColorClasses(event.eventType)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-0.5">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {getEventTypeLabel(event.eventType)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
                      <span>{formatEventTime(event.startTime)}</span>
                      <span>•</span>
                      <span>{event.isAllDay ? 'All day' : formatTime(event.startTime)}</span>
                    </div>
                    {event.course && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.course.title}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {event.meetingUrl && (
                <a
                  href={event.meetingUrl}
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
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('student.noUpcomingEvents')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('student.selfPacedCourse')}</p>
        </div>
      )}
    </div>
  );
}
