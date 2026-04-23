'use client';

import { useState } from 'react';
import { format } from 'date-fns';

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

interface AdminCalendarTableProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

type SortField = 'title' | 'eventType' | 'startTime' | 'visibility';
type SortOrder = 'asc' | 'desc';

const eventTypeLabels: Record<string, string> = {
  MEETING: 'Meeting',
  DEADLINE: 'Deadline',
  LIVE_CODING: 'Live Coding',
  QA_SESSION: 'Q&A Session',
  WORKSHOP: 'Workshop',
  STUDY_TIME: 'Study Time',
  EXAM: 'Exam',
  HOLIDAY: 'Holiday',
  OTHER: 'Other',
};

const eventTypeColors: Record<string, string> = {
  MEETING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  DEADLINE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  LIVE_CODING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  QA_SESSION: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  WORKSHOP: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  STUDY_TIME: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  EXAM: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200',
  HOLIDAY: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  OTHER: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const visibilityColors: Record<string, string> = {
  PUBLIC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  COURSE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PRIVATE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function AdminCalendarTable({
  events,
  onEdit,
  onDelete,
}: AdminCalendarTableProps) {
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'eventType':
        comparison = a.eventType.localeCompare(b.eventType);
        break;
      case 'startTime':
        comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        break;
      case 'visibility':
        comparison = a.visibility.localeCompare(b.visibility);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg
          className="w-4 h-4 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg
        className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('eventType')}
              >
                <div className="flex items-center">
                  Type
                  <SortIcon field="eventType" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('startTime')}
              >
                <div className="flex items-center">
                  Date & Time
                  <SortIcon field="startTime" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Course
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('visibility')}
              >
                <div className="flex items-center">
                  Visibility
                  <SortIcon field="visibility" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No events found. Create your first event to get started.
                </td>
              </tr>
            ) : (
              sortedEvents.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        eventTypeColors[event.eventType]
                      }`}
                    >
                      {eventTypeLabels[event.eventType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {event.isAllDay ? (
                      <div>
                        <div>{format(new Date(event.startTime), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">All Day</div>
                      </div>
                    ) : (
                      <div>
                        <div>{formatDateTime(event.startTime)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          to {format(new Date(event.endTime), 'h:mm a')}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {event.course ? event.course.title : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        visibilityColors[event.visibility]
                      }`}
                    >
                      {event.visibility}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {event.creator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(event)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(event)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
