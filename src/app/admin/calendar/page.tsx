'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';
import AdminCalendarGrid from '@/components/calendar/AdminCalendarGrid';
import AdminCalendarTable from '@/components/calendar/AdminCalendarTable';
import EventFormModal from '@/components/calendar/EventFormModal';
import DeleteEventModal from '@/components/calendar/DeleteEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingUrl?: string;
  eventType: string;
  visibility: string;
  courseId?: string;
  isAllDay: boolean;
  recurrence?: string;
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

export default function AdminCalendarPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchEvents();
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filterType, filterCourse]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔵 [Google Calendar API] Fetching events from /api/calendar/events');
      const response = await axios.get('/api/calendar/events');
      console.log('🟢 [Google Calendar API] Events fetched successfully:', response.data);
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('🔴 [Google Calendar API] Failed to fetch events:', error);
      showMessage('error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('🔵 [API] Fetching courses from /api/admin/courses');
      const response = await axios.get('/api/admin/courses');
      console.log('🟢 [API] Courses fetched successfully:', response.data);
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('🔴 [API] Failed to fetch courses:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filterType) {
      filtered = filtered.filter((event) => event.eventType === filterType);
    }

    if (filterCourse) {
      filtered = filtered.filter((event) => event.courseId === filterCourse);
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (selectedEvent) {
        // Update existing event
        console.log('🔵 [Google Calendar API] Updating event:', selectedEvent.id, eventData);
        const response = await axios.put(`/api/calendar/events/${selectedEvent.id}`, eventData);
        console.log('🟢 [Google Calendar API] Event updated successfully:', response.data);
        if (response.data.success) {
          showMessage('success', 'Event updated successfully');
          fetchEvents();
        }
      } else {
        // Create new event
        console.log('🔵 [Google Calendar API] Creating event:', eventData);
        const response = await axios.post('/api/calendar/events', eventData);
        console.log('🟢 [Google Calendar API] Event created successfully:', response.data);
        if (response.data.success) {
          showMessage('success', 'Event created successfully');
          fetchEvents();
        }
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('🔴 [Google Calendar API] Failed to save event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save event';
      showMessage('error', errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      console.log('🔵 [Google Calendar API] Deleting event:', selectedEvent.id);
      const response = await axios.delete(`/api/calendar/events/${selectedEvent.id}`);
      console.log('🟢 [Google Calendar API] Event deleted successfully:', response.data);
      if (response.data.success) {
        showMessage('success', 'Event deleted successfully');
        fetchEvents();
      }
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('🔴 [Google Calendar API] Failed to delete event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete event';
      showMessage('error', errorMessage);
    }
  };

  const handleListDeleteEvent = async (eventId: string) => {
    try {
      setDeleting(eventId);
      console.log('🔵 [Google Calendar API] Deleting event from list:', eventId);
      const res = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('🟢 [Google Calendar API] List delete response:', data);

      if (data.success) {
        showMessage('success', 'Event deleted successfully and removed from all users\' Google Calendars');
        setDeleteConfirm(null);
        fetchEvents();
      } else {
        showMessage('error', data.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('🔴 [Google Calendar API] Error deleting event:', err);
      showMessage('error', 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      MEETING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      DEADLINE: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      LIVE_CODING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      QA_SESSION: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      WORKSHOP: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      STUDY_TIME: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      EXAM: 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400',
      HOLIDAY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    return colors[type] || colors.OTHER;
  };

  const eventTypes = [
    { value: 'MEETING', label: 'Meeting' },
    { value: 'DEADLINE', label: 'Deadline' },
    { value: 'LIVE_CODING', label: 'Live Coding' },
    { value: 'QA_SESSION', label: 'Q&A Session' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'STUDY_TIME', label: 'Study Time' },
    { value: 'EXAM', label: 'Exam' },
    { value: 'HOLIDAY', label: 'Holiday' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header - Fixed to stay visible */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Course Calendar Management
        </h1>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/instructor/calendar-config"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sync with Google Calendar
          </Link>

          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Grid View
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            View as Event List
          </button>

          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Create Event
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

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course
          </label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Courses</option>
            {(courses || []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {(filterType || filterCourse) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterType('');
                setFilterCourse('');
              }}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Calendar Views */}
          {viewMode === 'grid' ? (
            <AdminCalendarGrid
              events={filteredEvents}
              onEventSelect={handleEditEvent}
            />
          ) : (
            /* List View - Merged from list page */
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No events found. Create your first event to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((event: any) => (
                        <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {event.description}
                              </div>
                            )}
                            {event.location && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                📍 {event.location}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                              {event.eventType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {event.isAllDay ? (
                              <div>
                                <div>{format(new Date(event.startTime), 'MMM dd, yyyy')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">All day</div>
                              </div>
                            ) : (
                              <div>
                                <div>{format(new Date(event.startTime), 'MMM dd, yyyy')}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {event.course ? event.course.title : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              event.visibility === 'PUBLIC' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              event.visibility === 'COURSE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                              event.visibility === 'CUSTOM' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {event.visibility}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>{event.creator?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {event.creator?.role}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              {deleteConfirm === event.id ? (
                                <>
                                  <button
                                    onClick={() => handleListDeleteEvent(event.id)}
                                    disabled={deleting === event.id}
                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                                  >
                                    {deleting === event.id ? 'Deleting...' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(event.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Event Form Modal */}
      {showEventModal && (
        <EventFormModal
          event={selectedEvent}
          courses={courses}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={async (eventId: string) => {
            try {
              console.log('🔵 [Google Calendar API] Deleting event from modal:', eventId);
              const response = await axios.delete(`/api/calendar/events/${eventId}`);
              console.log('🟢 [Google Calendar API] Event deleted from modal:', response.data);
              if (response.data.success) {
                showMessage('success', 'Event deleted successfully and removed from all users\' Google Calendars');
                fetchEvents();
              }
            } catch (error: any) {
              console.error('🔴 [Google Calendar API] Failed to delete event from modal:', error);
              const errorMessage = error.response?.data?.error || 'Failed to delete event';
              showMessage('error', errorMessage);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <DeleteEventModal
          event={selectedEvent}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedEvent(null);
          }}
          onConfirm={handleDeleteEvent}
        />
      )}
    </div>
  );
}
