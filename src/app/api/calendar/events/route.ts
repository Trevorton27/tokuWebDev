import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { EventType, EventVisibility, Role } from '@prisma/client';
import { syncEventToAllRelevantUsers } from '@/server/google-calendar/syncService';

/**
 * GET /api/calendar/events
 *
 * Get calendar events for the authenticated user.
 * Filters events based on user role and visibility rules.
 *
 * Query Parameters:
 * - startDate: ISO string - Filter events starting from this date
 * - endDate: ISO string - Filter events until this date
 * - type: EventType - Filter by event type
 * - courseId: string - Filter by course
 *
 * Returns events that the user is allowed to see:
 * - STUDENT: PUBLIC events, COURSE events for enrolled courses, own PRIVATE events
 * - INSTRUCTOR: All events for courses they teach + own events
 * - ADMIN: All events
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as EventType | null;
    const courseId = searchParams.get('courseId');

    // Build base query
    const where: any = {};

    // Date filtering
    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({
          endTime: { gte: new Date(startDate) }
        });
      }
      if (endDate) {
        where.AND.push({
          startTime: { lte: new Date(endDate) }
        });
      }
    }

    // Type filtering
    if (type) {
      where.eventType = type;
    }

    // Course filtering
    if (courseId) {
      where.courseId = courseId;
    }

    // Role-based visibility filtering
    if (user.role === 'ADMIN') {
      // Admins see all events (no additional filters)
    } else if (user.role === 'INSTRUCTOR') {
      // Instructors see:
      // - All PUBLIC events
      // - Events for courses they teach
      // - Their own events
      const teachingCourses = await prisma.course.findMany({
        where: { instructorId: user.id },
        select: { id: true }
      });
      const courseIds = teachingCourses.map(c => c.id);

      where.OR = [
        { visibility: 'PUBLIC' },
        { createdBy: user.id },
        { courseId: { in: courseIds } },
        { attendees: { has: user.id } }
      ];
    } else {
      // Students see:
      // - All PUBLIC events
      // - COURSE events for courses they're enrolled in
      // - Their own PRIVATE events
      // - Events where they're listed as attendees
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true }
      });
      const enrolledCourseIds = enrollments.map(e => e.courseId);

      where.OR = [
        { visibility: 'PUBLIC' },
        {
          AND: [
            { visibility: 'COURSE' },
            { courseId: { in: enrolledCourseIds } }
          ]
        },
        {
          AND: [
            { visibility: 'PRIVATE' },
            { createdBy: user.id }
          ]
        },
        { attendees: { has: user.id } }
      ];
    }

    // Fetch events
    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/calendar/events failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/events
 *
 * Create a new calendar event.
 *
 * Request Body:
 * {
 *   title: string;
 *   description?: string;
 *   startTime: string (ISO);
 *   endTime: string (ISO);
 *   location?: string;
 *   meetingUrl?: string;
 *   eventType: EventType;
 *   visibility?: EventVisibility;
 *   courseId?: string;
 *   isAllDay?: boolean;
 *   attendees?: string[];
 *   reminderMinutes?: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      meetingUrl,
      eventType,
      visibility = 'PUBLIC',
      courseId,
      isAllDay = false,
      attendees = [],
      reminderMinutes
    } = body;

    // Validation
    if (!title || !startTime || !endTime || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, startTime, endTime, eventType' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Role-based permission check
    // Students can only create STUDY_TIME events with PRIVATE visibility
    if (user.role === 'STUDENT') {
      if (eventType !== 'STUDY_TIME') {
        return NextResponse.json(
          { success: false, error: 'Students can only create STUDY_TIME events' },
          { status: 403 }
        );
      }
      if (visibility !== 'PRIVATE') {
        return NextResponse.json(
          { success: false, error: 'Student events must be PRIVATE' },
          { status: 403 }
        );
      }
    }

    // If courseId is provided, verify user has access to that course
    if (courseId) {
      if (user.role === 'INSTRUCTOR') {
        const course = await prisma.course.findFirst({
          where: {
            id: courseId,
            instructorId: user.id
          }
        });
        if (!course) {
          return NextResponse.json(
            { success: false, error: 'You do not have access to this course' },
            { status: 403 }
          );
        }
      }
      // Admins can create events for any course
    }

    // Create event
    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        meetingUrl,
        eventType,
        visibility,
        courseId,
        isAllDay,
        attendees,
        reminderMinutes,
        createdBy: user.id,
        createdByRole: user.role as Role
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    logger.info('Calendar event created', {
      eventId: event.id,
      createdBy: user.id,
      eventType
    });

    // Trigger Google Calendar sync (async, non-blocking)
    syncEventToAllRelevantUsers(event).catch((err) => {
      logger.error('Failed to sync event to Google Calendar', err, {
        eventId: event.id,
      });
    });

    return NextResponse.json({
      success: true,
      event
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('POST /api/calendar/events failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
