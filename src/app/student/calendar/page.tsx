'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../components/calendar/calendar-styles.css';
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
  createdBy: string;
  course?: {
    id: string;
    title: string;
  };
  creator: {
    id: string;
    name: string;
  };
}

const localizer = momentLocalizer(moment);

// Map event types to colors
const getEventColor = (eventType: string): string => {
  const colorMap: Record<string, string> = {
    MEETING: '#3B82F6',
    DEADLINE: '#EF4444',
    LIVE_CODING: '#8B5CF6',
    QA_SESSION: '#10B981',
    WORKSHOP: '#F59E0B',
    STUDY_TIME: '#6B7280',
    EXAM: '#DC2626',
    HOLIDAY: '#14B8A6',
    OTHER: '#64748B',
  };

  return colorMap[eventType] || colorMap.OTHER;
};

export default function StudentCalendarPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine' | 'course'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState<{
    connected: boolean;
    lastSync?: Date;
  } | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCurrentUser();
    fetchGoogleCalendarStatus();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [events, filter, userId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUserId(response.data.user.id);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/calendar/events');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showMessage('error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleCalendarStatus = async () => {
    try {
      const response = await axios.get('/api/google-calendar/token');
      if (response.data.success) {
        setGoogleCalendarStatus({
          connected: response.data.connected,
          lastSync: response.data.lastSync ? new Date(response.data.lastSync) : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch Google Calendar status:', error);
      // Silently fail - this is not critical
    }
  };

  const applyFilter = () => {
    if (!userId) {
      setFilteredEvents(events);
      return;
    }

    let filtered = [...events];

    if (filter === 'mine') {
      filtered = filtered.filter((event) => event.createdBy === userId);
    } else if (filter === 'course') {
      filtered = filtered.filter(
        (event) => event.visibility === 'COURSE' || event.visibility === 'PUBLIC'
      );
    }

    setFilteredEvents(filtered);
  };

  const handleCreateStudyTime = () => {
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  const handleSelectEvent = (event: Event) => {
    const calendarEvent = event.resource as CalendarEvent;
    setSelectedEvent(calendarEvent);
    setShowDetailsModal(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Transform events to react-big-calendar format
  const calendarEvents: Event[] = filteredEvents.map((event) => ({
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    allDay: event.isAllDay,
    resource: event,
  }));

  const eventStyleGetter = (event: Event) => {
    const calendarEvent = event.resource as CalendarEvent;
    const backgroundColor = getEventColor(calendarEvent.eventType);

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 5px',
      },
    };
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('student.myCalendar') || 'My Calendar'}
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('course')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'course'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Course Events
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'mine'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            My Events
          </button>
          <button
            onClick={handleCreateStudyTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Study Time
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Google Calendar Sync Status Banner */}
      {googleCalendarStatus && (
        <div className={`mb-4 p-4 rounded-lg border ${
          googleCalendarStatus.connected
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full ${
                googleCalendarStatus.connected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  googleCalendarStatus.connected
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {googleCalendarStatus.connected ? (
                    <>
                      Google Calendar Sync Active
                      {googleCalendarStatus.lastSync && (
                        <span className="font-normal ml-2">
                          (Last synced: {moment(googleCalendarStatus.lastSync).fromNow()})
                        </span>
                      )}
                    </>
                  ) : (
                    'Google Calendar Not Connected'
                  )}
                </p>
                <p className={`text-xs mt-1 ${
                  googleCalendarStatus.connected
                    ? 'text-blue-700 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {googleCalendarStatus.connected
                    ? 'Events are automatically synced to your Google Calendar'
                    : 'Connect your Google Calendar to receive notifications and sync events'
                  }
                </p>
              </div>
            </div>
            <a
              href="/student/settings"
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                googleCalendarStatus.connected
                  ? 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {googleCalendarStatus.connected ? 'Manage' : 'Connect'}
            </a>
          </div>
        </div>
      )}

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center items-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            className="dark:text-gray-100"
          />
        </div>
      )}

      {/* Create Study Time Modal */}
      {showCreateModal && (
        <StudentEventModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedEvent(null);
          }}
          onSave={async (eventData: any) => {
            try {
              const response = await axios.post('/api/calendar/events', eventData);
              if (response.data.success) {
                showMessage('success', 'Study time added successfully');
                fetchEvents();
                setShowCreateModal(false);
              }
            } catch (error: any) {
              const errorMessage = error.response?.data?.error || 'Failed to create event';
              showMessage('error', errorMessage);
            }
          }}
        />
      )}

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          userId={userId}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onDelete={async () => {
            try {
              const response = await axios.delete(`/api/calendar/events/${selectedEvent.id}`);
              if (response.data.success) {
                showMessage('success', 'Event deleted successfully');
                fetchEvents();
                setShowDetailsModal(false);
              }
            } catch (error: any) {
              const errorMessage = error.response?.data?.error || 'Failed to delete event';
              showMessage('error', errorMessage);
            }
          }}
        />
      )}
    </div>
  );
}

// Student Event Modal Component (for creating study time)
function StudentEventModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    isAllDay: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData({
      ...formData,
      startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
    });
  }, []);

  const format = (date: Date, formatStr: string) => {
    return moment(date).format(formatStr.replace(/'/g, ''));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description || undefined,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location || undefined,
      eventType: 'STUDY_TIME',
      visibility: 'PRIVATE',
      isAllDay: formData.isAllDay,
    };

    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Add Study Time
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="e.g., Study for React Quiz"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  All day event
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Time *
                </label>
                <input
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Time *
                </label>
                <input
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="e.g., Library, Home"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Add Study Time
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Event Details Modal Component
function EventDetailsModal({
  event,
  userId,
  onClose,
  onDelete,
}: {
  event: CalendarEvent;
  userId: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  const canDelete = event.createdBy === userId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
              {event.title}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{event.eventType.replace('_', ' ')}</span>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {moment(event.startTime).format('MMM D, YYYY h:mm A')} - {moment(event.endTime).format('h:mm A')}
                </span>
              </div>

              {event.description && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="ml-2 text-gray-900 dark:text-white mt-1">{event.description}</p>
                </div>
              )}

              {event.location && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{event.location}</span>
                </div>
              )}

              {event.course && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Course:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{event.course.title}</span>
                </div>
              )}

              {event.creator && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created by:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{event.creator.name}</span>
                </div>
              )}

              {event.meetingUrl && (
                <div>
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
