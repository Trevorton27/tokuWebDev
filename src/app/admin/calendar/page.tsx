'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
        const response = await axios.put(`/api/calendar/events/${selectedEvent.id}`, eventData);
        if (response.data.success) {
          showMessage('success', 'Event updated successfully');
          fetchEvents();
        }
      } else {
        // Create new event
        const response = await axios.post('/api/calendar/events', eventData);
        if (response.data.success) {
          showMessage('success', 'Event created successfully');
          fetchEvents();
        }
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Failed to save event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save event';
      showMessage('error', errorMessage);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await axios.delete(`/api/calendar/events/${selectedEvent.id}`);
      if (response.data.success) {
        showMessage('success', 'Event deleted successfully');
        fetchEvents();
      }
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete event';
      showMessage('error', errorMessage);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Course Calendar Management
        </h1>

        <div className="flex gap-2">
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
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Table View
          </button>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
            <AdminCalendarTable
              events={filteredEvents}
              onEdit={handleEditEvent}
              onDelete={handleDeleteClick}
            />
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
