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
  eventType?: string;
  visibility?: string;
  isAllDay: boolean;
  htmlLink?: string;
  course?: {
    id: string;
    title: string;
  };
  creator?: {
    name?: string;
    email?: string;
  };
  organizer?: {
    name?: string;
    email?: string;
  };
}

interface CalendarEventsProps {
  configPath: string; // Path to calendar config page (e.g., '/student/calendar-config' or '/instructor/calendar-config')
}

export default function CalendarEvents({ configPath }: CalendarEventsProps) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
    checkGoogleCalendarStatus();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const endDate = addDays(now, 21); // Get events for next 3 weeks

      console.log('📅 Fetching upcoming events...');
      console.log('Date range:', { from: now.toISOString(), to: endDate.toISOString() });

      // Try to fetch from Google Calendar first
      const response = await axios.get('/api/google-calendar/events', {
        params: {
          timeMin: now.toISOString(),
          timeMax: endDate.toISOString(),
          maxResults: 10,
        },
      });

      console.log('Google Calendar API Response:', response.data);

      if (response.data.success && response.data.connected) {
        // Successfully got events from Google Calendar
        console.log('✅ Google Calendar connected, using Google Calendar events');
        console.log('Raw events from Google Calendar:', response.data.events);

        const sortedEvents = response.data.events
          .sort(
            (a: CalendarEvent, b: CalendarEvent) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          )
          .slice(0, 3);

        console.log('📊 Final sorted events to display (top 3):', sortedEvents);
        setEvents(sortedEvents);
      } else {
        // Google Calendar not connected, fallback to LMS events
        console.log('⚠️ Google Calendar not connected, falling back to LMS events');
        const lmsResponse = await axios.get('/api/calendar/events', {
          params: {
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
          },
        });

        console.log('LMS Events API Response:', lmsResponse.data);

        if (lmsResponse.data.success) {
          console.log('Raw events from LMS:', lmsResponse.data.events);

          const sortedEvents = lmsResponse.data.events
            .sort(
              (a: CalendarEvent, b: CalendarEvent) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )
            .slice(0, 3);

          console.log('📊 Final sorted events to display (top 3):', sortedEvents);
          setEvents(sortedEvents);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch calendar events:', error);
      // Try fallback to LMS events on error
      try {
        console.log('🔄 Attempting fallback to LMS events...');
        const now = new Date();
        const endDate = addDays(now, 21);
        const lmsResponse = await axios.get('/api/calendar/events', {
          params: {
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
          },
        });

        console.log('Fallback LMS Events API Response:', lmsResponse.data);

        if (lmsResponse.data.success) {
          console.log('Raw events from fallback LMS:', lmsResponse.data.events);

          const sortedEvents = lmsResponse.data.events
            .sort(
              (a: CalendarEvent, b: CalendarEvent) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )
            .slice(0, 3);

          console.log('📊 Final sorted events to display (top 3):', sortedEvents);
          setEvents(sortedEvents);
        }
      } catch (fallbackError) {
        console.error('❌ Failed to fetch fallback events:', fallbackError);
      }
    } finally {
      setLoading(false);
      console.log('✨ Event fetching complete');
    }
  };

  const checkGoogleCalendarStatus = async () => {
    try {
      const response = await axios.get('/api/google-calendar/token');
      console.log('🔗 Google Calendar Status:', response.data);
      if (response.data.success) {
        setGoogleCalendarConnected(response.data.connected);
        console.log('Google Calendar Connected:', response.data.connected);
      }
    } catch (error) {
      // Silently fail - this is not critical
      console.error('❌ Failed to check Google Calendar status:', error);
    }
  };

  const getEventIcon = (type?: string) => {
    // Default to calendar icon for Google Calendar events
    if (!type) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

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

  const getEventTypeLabel = (type?: string) => {
    if (!type) return t('instructor.eventOther');

    const labels: Record<string, string> = {
      MEETING: t('instructor.eventMeeting'),
      DEADLINE: t('instructor.eventDeadline'),
      LIVE_CODING: t('instructor.eventLiveCoding'),
      QA_SESSION: t('instructor.eventQASession'),
      WORKSHOP: t('instructor.eventWorkshop'),
      STUDY_TIME: t('instructor.eventStudyTime'),
      EXAM: t('instructor.eventExam'),
      HOLIDAY: t('instructor.eventHoliday'),
      OTHER: t('instructor.eventOther'),
    };
    return labels[type] || t('instructor.eventOther');
  };

  const getColorClasses = (type?: string) => {
    // Default color for Google Calendar events
    if (!type) {
      return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800';
    }

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
    if (isToday(date)) return t('instructor.today');
    if (isTomorrow(date)) return t('instructor.tomorrow');
    return format(date, 'MMM d');
  };

  const formatTime = (startTime: string) => {
    return format(new Date(startTime), 'h:mm a');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('instructor.upcomingEvents')}</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('instructor.upcomingEvents')}</h2>
      </div>

      {!googleCalendarConnected && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t('instructor.connectGoogleCalendar')}
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-200 mb-3">
                {t('instructor.googleCalendarSubtitle')}
              </p>
              <Link
                href={configPath}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                {t('instructor.configureGoogleCalendar')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {events.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
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
                      <span>{event.isAllDay ? t('instructor.allDay') : formatTime(event.startTime)}</span>
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
                  {t('instructor.joinMeeting')}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('instructor.noUpcomingEvents')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {googleCalendarConnected
              ? t('instructor.checkBackLater')
              : t('instructor.connectGoogleToSeeEvents')
            }
          </p>
        </div>
      )}

      {googleCalendarConnected === true && events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{t('instructor.syncedWithGoogle')}</span>
            </div>
            <Link
              href={configPath}
              className="text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-medium"
            >
              {t('instructor.manage')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
