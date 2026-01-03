'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import UserSelector from './UserSelector';

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

interface Course {
  id: string;
  title: string;
}

interface EventFormModalProps {
  event: CalendarEvent | null;
  courses: Course[];
  onClose: () => void;
  onSave: (eventData: any) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventFormModal({
  event,
  courses,
  onClose,
  onSave,
  onDelete,
}: EventFormModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingUrl: '',
    eventType: 'MEETING',
    visibility: 'PUBLIC',
    courseId: '',
    isAllDay: false,
    reminderMinutes: '',
    attendees: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      // Editing existing event
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);

      setFormData({
        title: event.title,
        description: event.description || '',
        startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        location: event.location || '',
        meetingUrl: event.meetingUrl || '',
        eventType: event.eventType,
        visibility: event.visibility,
        courseId: event.courseId || '',
        isAllDay: event.isAllDay,
        reminderMinutes: '',
        attendees: (event as any).attendees || [],
      });
    } else {
      // Creating new event - set default start time to now
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setFormData({
        ...formData,
        startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(oneHourLater, "yyyy-MM-dd'T'HH:mm"),
        attendees: [],
      });
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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

    if (formData.visibility === 'COURSE' && !formData.courseId) {
      newErrors.courseId = 'Course is required for COURSE visibility';
    }

    if (formData.visibility === 'CUSTOM' && formData.attendees.length === 0) {
      newErrors.attendees = 'At least one attendee is required for CUSTOM visibility';
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
      meetingUrl: formData.meetingUrl || undefined,
      eventType: formData.eventType,
      visibility: formData.visibility,
      courseId: formData.courseId || undefined,
      isAllDay: formData.isAllDay,
      reminderMinutes: formData.reminderMinutes
        ? parseInt(formData.reminderMinutes)
        : undefined,
      attendees: formData.visibility === 'CUSTOM' ? formData.attendees : undefined,
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      setShowDeleteConfirm(false);
      onClose();
    }
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

  const visibilityOptions = [
    { value: 'PUBLIC', label: 'Public', description: 'Visible to all students' },
    { value: 'COURSE', label: 'Course', description: 'Visible to enrolled students' },
    { value: 'CUSTOM', label: 'Custom', description: 'Visible to selected users' },
    { value: 'PRIVATE', label: 'Private', description: 'Visible only to you' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[740px] sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                {event ? 'Edit Event' : 'Create New Event'}
              </h3>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.title
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Event title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Event description"
                />
              </div>

              {/* Event Type */}
              <div>
                <label
                  htmlFor="eventType"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Visibility *
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                {errors.visibility && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.visibility}
                  </p>
                )}
              </div>

              {/* Course (conditional) */}
              {formData.visibility === 'COURSE' && (
                <div>
                  <label
                    htmlFor="courseId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Course *
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      errors.courseId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Select a course</option>
                    {(courses || []).map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {errors.courseId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.courseId}
                    </p>
                  )}
                </div>
              )}

              {/* Custom Attendees (conditional) */}
              {formData.visibility === 'CUSTOM' && (
                <div>
                  <UserSelector
                    selectedUserIds={formData.attendees}
                    onChange={(userIds) => {
                      setFormData({ ...formData, attendees: userIds });
                      if (errors.attendees && userIds.length > 0) {
                        setErrors({ ...errors, attendees: '' });
                      }
                    }}
                    role="ALL"
                    label="Select Attendees *"
                    placeholder="Search students or instructors..."
                  />
                  {errors.attendees && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.attendees}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select individual students or instructors who should see this event.
                  </p>
                </div>
              )}

              {/* All Day Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAllDay"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="isAllDay"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  All day event
                </label>
              </div>

              {/* Start Time */}
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Start Time *
                </label>
                <input
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.startTime
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  End Time *
                </label>
                <input
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.endTime
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endTime}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="e.g., Room 101, Online"
                />
              </div>

              {/* Meeting URL */}
              <div>
                <label
                  htmlFor="meetingUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Meeting URL
                </label>
                <input
                  type="url"
                  id="meetingUrl"
                  name="meetingUrl"
                  value={formData.meetingUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              {/* Reminder */}
              <div>
                <label
                  htmlFor="reminderMinutes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reminder (minutes before event)
                </label>
                <input
                  type="number"
                  id="reminderMinutes"
                  name="reminderMinutes"
                  value={formData.reminderMinutes}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="e.g., 15, 30, 60"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between items-center">
              {/* Delete button (only show when editing) */}
              {event && onDelete && (
                <div>
                  {showDeleteConfirm ? (
                    <div className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Event
                    </button>
                  )}
                </div>
              )}

              {/* Right side buttons */}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {event ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
