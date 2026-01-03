/**
 * Google Calendar Sync Service
 * High-level orchestration for syncing LMS events to Google Calendar
 * Handles role-based filtering, event conversion, and batch operations
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { calendar_v3 } from 'googleapis';
import {
  getDecryptedTokens,
  getValidAccessToken,
  updateLastSyncTime,
  disableSync,
} from './tokenManager';
import {
  createGoogleCalendarClient,
  retryWithBackoff,
  GoogleCalendarAuthError,
  GoogleCalendarRateLimitError,
  GoogleCalendarNotFoundError,
} from './googleCalendarClient';
import type { CalendarEvent, Role } from '@prisma/client';

export interface SyncResult {
  success: boolean;
  googleEventId?: string;
  error?: string;
}

export interface BatchSyncResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ eventId: string; error: string }>;
}

/**
 * Sync a single LMS event to Google Calendar
 * Handles both create and update automatically
 * @param userId - User ID to sync for
 * @param event - LMS calendar event
 * @returns Sync result
 */
export async function syncEventToGoogleCalendar(
  userId: string,
  event: CalendarEvent
): Promise<SyncResult> {
  try {
    console.log(`🔄 syncEventToGoogleCalendar called for event "${event.title}" (${event.id})`, {
      userId,
      visibility: event.visibility,
      hasGoogleEventId: !!event.googleEventId,
    });

    // Check if user has sync enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleCalendarSyncEnabled: true,
        googleCalendarId: true,
      },
    });

    if (!user || !user.googleCalendarSyncEnabled) {
      console.log(`  ⏭️  Skipping - sync not enabled for user ${userId}`);
      return { success: true }; // Skip if sync not enabled
    }

    const calendarId = user.googleCalendarId || 'primary';

    // Get valid access token (auto-refreshes if needed)
    const accessToken = await getValidAccessToken(userId);
    const tokens = await getDecryptedTokens(userId);
    if (!tokens) {
      throw new Error('No tokens available');
    }

    // Create Google Calendar client
    const client = createGoogleCalendarClient(accessToken, tokens.refreshToken);

    // Convert LMS event to Google Calendar format
    const googleEvent = convertToGoogleCalendarEvent(event);

    // Determine if this is create or update
    let googleEventId: string;

    if (event.googleEventId) {
      // Try to update existing event
      console.log(`  📝 Attempting to update existing event in Google Calendar (googleEventId: ${event.googleEventId})`);
      try {
        const result = await retryWithBackoff(async () => {
          return await client.updateEvent(calendarId, event.googleEventId!, googleEvent);
        });
        googleEventId = result.id!;

        console.log(`  ✅ Event updated successfully (googleEventId: ${googleEventId})`);
        logger.info('Event updated in Google Calendar', {
          userId,
          eventId: event.id,
          googleEventId,
        });
      } catch (updateError: any) {
        // If event not found (404), fall back to creating a new event
        if (updateError instanceof GoogleCalendarNotFoundError) {
          console.log(`  ⚠️  Event not found in Google Calendar, creating new event instead`);

          const result = await retryWithBackoff(async () => {
            return await client.createEvent(calendarId, googleEvent);
          });
          googleEventId = result.id!;

          // Update the database with new Google event ID
          await prisma.calendarEvent.update({
            where: { id: event.id },
            data: { googleEventId, googleCalendarId: calendarId },
          });

          console.log(`  ✨ New event created successfully (googleEventId: ${googleEventId})`);
          logger.info('Event created in Google Calendar (after 404)', {
            userId,
            eventId: event.id,
            googleEventId,
            oldGoogleEventId: event.googleEventId,
          });
        } else {
          // Re-throw other errors
          throw updateError;
        }
      }
    } else {
      // Create new event
      console.log(`  ✨ Creating new event in Google Calendar`);
      const result = await retryWithBackoff(async () => {
        return await client.createEvent(calendarId, googleEvent);
      });
      googleEventId = result.id!;

      // Store Google event ID in LMS database
      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: { googleEventId, googleCalendarId: calendarId },
      });

      console.log(`  ✅ Event created successfully and googleEventId stored (googleEventId: ${googleEventId})`);
      logger.info('Event created in Google Calendar', {
        userId,
        eventId: event.id,
        googleEventId,
      });
    }

    console.log(`  ✅ Returning success for event "${event.title}"`);
    return { success: true, googleEventId };
  } catch (error: any) {
    console.log(`  ❌ Error syncing event "${event.title}":`, error.message, error);
    logger.error('Failed to sync event to Google Calendar', error, {
      userId,
      eventId: event.id,
    });

    // Handle auth errors by disabling sync
    if (error instanceof GoogleCalendarAuthError) {
      console.log(`  🔐 Auth error - disabling sync for user ${userId}`);
      await disableSync(userId);
      return {
        success: false,
        error: 'Authentication failed. Please reconnect Google Calendar.',
      };
    }

    console.log(`  ❌ Returning failure:`, error.message);
    return {
      success: false,
      error: error.message || 'Failed to sync event',
    };
  }
}

/**
 * Delete an event from Google Calendar
 * @param userId - User ID
 * @param event - LMS calendar event to delete
 */
export async function deleteEventFromGoogleCalendar(
  userId: string,
  event: CalendarEvent
): Promise<SyncResult> {
  try {
    // Check if event has been synced to Google Calendar
    if (!event.googleEventId) {
      return { success: true }; // Nothing to delete
    }

    // Check if user has sync enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleCalendarSyncEnabled: true,
        googleCalendarId: true,
      },
    });

    if (!user || !user.googleCalendarSyncEnabled) {
      return { success: true }; // Skip if sync not enabled
    }

    const calendarId = user.googleCalendarId || 'primary';

    // Get valid access token
    const accessToken = await getValidAccessToken(userId);
    const tokens = await getDecryptedTokens(userId);
    if (!tokens) {
      throw new Error('No tokens available');
    }

    // Create Google Calendar client
    const client = createGoogleCalendarClient(accessToken, tokens.refreshToken);

    // Delete event from Google Calendar
    await retryWithBackoff(async () => {
      await client.deleteEvent(calendarId, event.googleEventId!);
    });

    logger.info('Event deleted from Google Calendar', {
      userId,
      eventId: event.id,
      googleEventId: event.googleEventId,
    });

    return { success: true };
  } catch (error: any) {
    // If event not found, that's OK (already deleted)
    if (error instanceof GoogleCalendarNotFoundError) {
      logger.warn('Event already deleted from Google Calendar', {
        userId,
        eventId: event.id,
      });
      return { success: true };
    }

    logger.error('Failed to delete event from Google Calendar', error, {
      userId,
      eventId: event.id,
    });

    return {
      success: false,
      error: error.message || 'Failed to delete event',
    };
  }
}

/**
 * Batch sync all visible events for a user
 * @param userId - User ID
 * @returns Batch sync results
 */
export async function batchSyncEvents(userId: string): Promise<BatchSyncResult> {
  const result: BatchSyncResult = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get all events visible to this user
    const events = await getEventsVisibleToUser(userId);
    result.total = events.length;

    console.log('📅 Starting batch sync:', {
      userId,
      totalEvents: events.length,
      eventTitles: events.map(e => ({
        id: e.id,
        title: e.title,
        visibility: e.visibility,
        hasGoogleEventId: !!e.googleEventId,
        attendees: e.attendees,
      })),
    });

    logger.info('Starting batch sync', { userId, totalEvents: events.length });

    // Process events in batches to avoid overwhelming the API
    const BATCH_SIZE = 10;
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((event) => syncEventToGoogleCalendar(userId, event))
      );

      // Tally results
      results.forEach((promiseResult, index) => {
        const event = batch[index];
        console.log(`🔍 Sync result for event "${event.title}" (${event.id}):`, {
          status: promiseResult.status,
          hadGoogleEventId: !!event.googleEventId,
        });

        if (promiseResult.status === 'fulfilled') {
          const syncResult = promiseResult.value;
          console.log('  ✅ Promise fulfilled, syncResult:', syncResult);

          if (syncResult.success) {
            if (event.googleEventId) {
              result.updated++;
              console.log('  📝 Counted as UPDATED (had googleEventId)');
            } else {
              result.created++;
              console.log('  ✨ Counted as CREATED (no googleEventId before)');
            }
          } else {
            result.failed++;
            result.errors.push({
              eventId: event.id,
              error: syncResult.error || 'Unknown error',
            });
            console.log('  ❌ Counted as FAILED:', syncResult.error);
          }
        } else {
          result.failed++;
          result.errors.push({
            eventId: event.id,
            error: promiseResult.reason?.message || 'Unknown error',
          });
          console.log('  ❌ Promise rejected:', promiseResult.reason?.message);
        }
      });

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < events.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Update last sync time
    await updateLastSyncTime(userId);

    logger.info('Batch sync completed', {
      userId,
      ...result,
    });

    return result;
  } catch (error: any) {
    logger.error('Batch sync failed', error, { userId });
    throw error;
  }
}

/**
 * Sync event to all relevant users (based on visibility and role)
 * Called when an event is created or updated
 * @param event - Calendar event to sync
 */
export async function syncEventToAllRelevantUsers(
  event: CalendarEvent & { course?: { id: string } | null }
): Promise<void> {
  try {
    // Get all users who should see this event
    const relevantUsers = await getUsersWhoShouldSeeEvent(event);

    logger.info('Syncing event to relevant users', {
      eventId: event.id,
      userCount: relevantUsers.length,
    });

    // Sync to each user (in parallel, with error handling)
    const results = await Promise.allSettled(
      relevantUsers.map((user) => syncEventToGoogleCalendar(user.id, event))
    );

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error('Failed to sync event to user', result.reason, {
          eventId: event.id,
          userId: relevantUsers[index].id,
        });
      }
    });
  } catch (error) {
    logger.error('Failed to sync event to all users', error, {
      eventId: event.id,
    });
    // Don't throw - sync failures shouldn't break event creation
  }
}

/**
 * Delete event from all relevant users' Google Calendars
 * Called when an event is deleted
 * @param event - Calendar event being deleted
 */
export async function deleteEventFromAllRelevantUsers(
  event: CalendarEvent & { course?: { id: string } | null }
): Promise<void> {
  try {
    const relevantUsers = await getUsersWhoShouldSeeEvent(event);

    logger.info('Deleting event from relevant users', {
      eventId: event.id,
      userCount: relevantUsers.length,
    });

    // Delete from each user's calendar
    await Promise.allSettled(
      relevantUsers.map((user) => deleteEventFromGoogleCalendar(user.id, event))
    );
  } catch (error) {
    logger.error('Failed to delete event from all users', error, {
      eventId: event.id,
    });
    // Don't throw - sync failures shouldn't break event deletion
  }
}

/**
 * Get all events visible to a user based on their role
 * Matches the logic in GET /api/calendar/events
 * @param userId - User ID
 * @returns Events visible to user
 */
async function getEventsVisibleToUser(userId: string): Promise<CalendarEvent[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const where: any = {};

  if (user.role === 'ADMIN') {
    // Admins see all events
  } else if (user.role === 'INSTRUCTOR') {
    // Instructors see PUBLIC + their courses + own events + attendee events
    const teachingCourses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    });
    const courseIds = teachingCourses.map((c) => c.id);

    where.OR = [
      { visibility: 'PUBLIC' },
      { createdBy: userId },
      { courseId: { in: courseIds } },
      { attendees: { has: userId } },
    ];
  } else {
    // Students see PUBLIC + enrolled courses + own PRIVATE + attendee events
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    where.OR = [
      { visibility: 'PUBLIC' },
      {
        AND: [
          { visibility: 'COURSE' },
          { courseId: { in: enrolledCourseIds } },
        ],
      },
      {
        AND: [{ visibility: 'PRIVATE' }, { createdBy: userId }],
      },
      { attendees: { has: userId } },
    ];
  }

  return await prisma.calendarEvent.findMany({
    where,
    orderBy: { startTime: 'asc' },
  });
}

/**
 * Get users who should see an event (for syncing)
 * @param event - Calendar event
 * @returns Users who should see this event
 */
async function getUsersWhoShouldSeeEvent(
  event: CalendarEvent & { course?: { id: string } | null }
): Promise<Array<{ id: string; role: Role }>> {
  const users: Array<{ id: string; role: Role }> = [];

  // Only sync to users with Google Calendar enabled
  const syncEnabledUsers = await prisma.user.findMany({
    where: { googleCalendarSyncEnabled: true },
    select: { id: true, role: true },
  });

  if (event.visibility === 'PUBLIC') {
    // All users with sync enabled
    return syncEnabledUsers;
  }

  if (event.visibility === 'PRIVATE') {
    // Only the creator
    return syncEnabledUsers.filter((u) => u.id === event.createdBy);
  }

  if (event.visibility === 'COURSE' && event.courseId) {
    // Students enrolled in the course + instructors of the course + admins
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { courseId: event.courseId },
      select: { userId: true },
    });

    const course = await prisma.course.findUnique({
      where: { id: event.courseId },
      select: { instructorId: true },
    });

    const relevantUserIds = new Set([
      ...enrolledStudents.map((e) => e.userId),
      ...(course?.instructorId ? [course.instructorId] : []),
    ]);

    return syncEnabledUsers.filter(
      (u) => relevantUserIds.has(u.id) || u.role === 'ADMIN'
    );
  }

  if (event.visibility === 'CUSTOM') {
    // Only users explicitly listed in attendees array
    if (event.attendees && event.attendees.length > 0) {
      return syncEnabledUsers.filter((u) => event.attendees.includes(u.id));
    }
    return [];
  }

  // Fallback: check attendees array (for backwards compatibility)
  if (event.attendees && event.attendees.length > 0) {
    return syncEnabledUsers.filter((u) => event.attendees.includes(u.id));
  }

  return [];
}

/**
 * Convert LMS CalendarEvent to Google Calendar Event format
 * @param event - LMS calendar event
 * @returns Google Calendar event object
 */
function convertToGoogleCalendarEvent(
  event: CalendarEvent
): calendar_v3.Schema$Event {
  const googleEvent: calendar_v3.Schema$Event = {
    summary: event.title,
    description: event.description || undefined,
    location: event.location || undefined,
  };

  // Handle all-day events
  if (event.isAllDay) {
    googleEvent.start = {
      date: event.startTime.toISOString().split('T')[0], // YYYY-MM-DD
    };
    googleEvent.end = {
      date: event.endTime.toISOString().split('T')[0],
    };
  } else {
    googleEvent.start = {
      dateTime: event.startTime.toISOString(),
      timeZone: 'UTC', // Store in UTC, Google Calendar handles timezone conversion
    };
    googleEvent.end = {
      dateTime: event.endTime.toISOString(),
      timeZone: 'UTC',
    };
  }

  // Add meeting URL as conferenceData or in description
  if (event.meetingUrl) {
    googleEvent.description = googleEvent.description
      ? `${googleEvent.description}\n\nMeeting URL: ${event.meetingUrl}`
      : `Meeting URL: ${event.meetingUrl}`;
  }

  // Add reminders if specified
  if (event.reminderMinutes) {
    googleEvent.reminders = {
      useDefault: false,
      overrides: [
        {
          method: 'popup',
          minutes: event.reminderMinutes,
        },
        {
          method: 'email',
          minutes: event.reminderMinutes,
        },
      ],
    };
  }

  // Add recurrence if specified (RRULE format)
  if (event.recurrence) {
    googleEvent.recurrence = [event.recurrence];
  }

  // Add event source metadata
  googleEvent.source = {
    title: 'Signal Works LMS',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/calendar`,
  };

  // Add color coding based on event type
  const colorMap: Record<string, string> = {
    MEETING: '9', // Blue
    DEADLINE: '11', // Red
    LIVE_CODING: '3', // Purple
    QA_SESSION: '10', // Green
    WORKSHOP: '6', // Orange
    STUDY_TIME: '8', // Gray
    EXAM: '11', // Red
    HOLIDAY: '2', // Sage
    OTHER: '7', // Cyan
  };
  googleEvent.colorId = colorMap[event.eventType] || colorMap.OTHER;

  return googleEvent;
}
