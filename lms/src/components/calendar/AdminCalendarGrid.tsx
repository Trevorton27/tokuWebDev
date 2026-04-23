'use client';

import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const localizer = momentLocalizer(moment);

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

interface AdminCalendarGridProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
}

// Map event types to colors
const getEventColor = (eventType: string): string => {
  const colorMap: Record<string, string> = {
    MEETING: '#3B82F6', // Blue
    DEADLINE: '#EF4444', // Red
    LIVE_CODING: '#8B5CF6', // Purple
    QA_SESSION: '#10B981', // Green
    WORKSHOP: '#F59E0B', // Orange
    STUDY_TIME: '#6B7280', // Gray
    EXAM: '#DC2626', // Dark Red
    HOLIDAY: '#14B8A6', // Teal
    OTHER: '#64748B', // Slate
  };

  return colorMap[eventType] || colorMap.OTHER;
};

export default function AdminCalendarGrid({
  events,
  onEventSelect,
}: AdminCalendarGridProps) {
  // Transform events to react-big-calendar format
  const calendarEvents: Event[] = events.map((event) => ({
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    allDay: event.isAllDay,
    resource: event, // Store the full event data
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

  const handleSelectEvent = (event: Event) => {
    const calendarEvent = event.resource as CalendarEvent;
    onEventSelect(calendarEvent);
  };

  return (
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
  );
}
