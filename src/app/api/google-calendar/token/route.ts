/**
 * Google Calendar Token Management
 * GET /api/google-calendar/token - Check connection status
 * DELETE /api/google-calendar/token - Disconnect Google Calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { disconnectGoogleCalendar } from '@/server/google-calendar/tokenManager';

/**
 * GET /api/google-calendar/token
 * Check Google Calendar connection status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user's Google Calendar connection status
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        googleCalendarSyncEnabled: true,
        googleCalendarId: true,
        googleCalendarLastSync: true,
        googleTokenExpiry: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      connected: userData.googleCalendarSyncEnabled,
      calendarId: userData.googleCalendarId,
      lastSync: userData.googleCalendarLastSync,
      tokenExpiry: userData.googleTokenExpiry,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('Failed to get Google Calendar token status', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/google-calendar/token
 * Disconnect Google Calendar sync
 * Removes all tokens and clears sync status
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get all events that have been synced for this user
    const syncedEvents = await prisma.calendarEvent.findMany({
      where: {
        googleEventId: { not: null },
        OR: [
          { createdBy: user.id },
          { attendees: { has: user.id } },
          { visibility: 'PUBLIC' },
        ],
      },
      select: { id: true, googleEventId: true },
    });

    logger.info('Disconnecting Google Calendar', {
      userId: user.id,
      syncedEventsCount: syncedEvents.length,
    });

    // Note: We're not deleting events from Google Calendar on disconnect
    // This allows users to keep their synced events in Google Calendar
    // If you want to delete them, you would:
    // 1. Get valid access token
    // 2. Create Google Calendar client
    // 3. Delete each event
    // 4. Then disconnect

    // Clear googleEventId from all events created by this user
    await prisma.calendarEvent.updateMany({
      where: {
        createdBy: user.id,
        googleEventId: { not: null },
      },
      data: {
        googleEventId: null,
        googleCalendarId: null,
      },
    });

    // Disconnect and remove all tokens
    await disconnectGoogleCalendar(user.id);

    logger.info('Google Calendar disconnected successfully', {
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('Failed to disconnect Google Calendar', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
