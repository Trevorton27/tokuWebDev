import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  syncEventToAllRelevantUsers,
  deleteEventFromAllRelevantUsers,
} from '@/server/google-calendar/syncService';

/**
 * PUT /api/calendar/events/[id]
 *
 * Update a calendar event.
 * Only the creator or admins can update an event.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await request.json();

    // Fetch existing event
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Permission check: only creator or admin can update
    if (user.role !== 'ADMIN' && existingEvent.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this event' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      meetingUrl,
      eventType,
      visibility,
      courseId,
      isAllDay,
      attendees,
      reminderMinutes
    } = body;

    // Validate dates if provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (start >= end) {
        return NextResponse.json(
          { success: false, error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    // Update event
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(meetingUrl !== undefined && { meetingUrl }),
        ...(eventType !== undefined && { eventType }),
        ...(visibility !== undefined && { visibility }),
        ...(courseId !== undefined && { courseId }),
        ...(isAllDay !== undefined && { isAllDay }),
        ...(attendees !== undefined && { attendees }),
        ...(reminderMinutes !== undefined && { reminderMinutes })
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

    logger.info('Calendar event updated', {
      eventId: id,
      updatedBy: user.id
    });

    // Trigger Google Calendar sync for updated event (async, non-blocking)
    syncEventToAllRelevantUsers(updatedEvent).catch((err) => {
      logger.error('Failed to sync updated event to Google Calendar', err, {
        eventId: id,
      });
    });

    return NextResponse.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('PUT /api/calendar/events/[id] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/[id]
 *
 * Delete a calendar event.
 * Only the creator or admins can delete an event.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Fetch existing event
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Permission check: only creator or admin can delete
    if (user.role !== 'ADMIN' && existingEvent.createdBy !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this event' },
        { status: 403 }
      );
    }

    // Delete from Google Calendar first (async, non-blocking but we wait for it)
    await deleteEventFromAllRelevantUsers(existingEvent).catch((err) => {
      logger.error('Failed to delete event from Google Calendar', err, {
        eventId: id,
      });
      // Continue with LMS deletion even if Google Calendar deletion fails
    });

    // Delete event from LMS database
    await prisma.calendarEvent.delete({
      where: { id }
    });

    logger.info('Calendar event deleted', {
      eventId: id,
      deletedBy: user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('DELETE /api/calendar/events/[id] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}
