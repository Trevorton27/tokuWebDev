import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getValidAccessToken, getDecryptedTokens } from '@/server/google-calendar/tokenManager';
import { createGoogleCalendarClient } from '@/server/google-calendar/googleCalendarClient';
import prisma from '@/lib/prisma';

/**
 * GET /api/google-calendar/events
 *
 * Fetch events from user's Google Calendar
 *
 * Query Parameters:
 * - maxResults: number (default: 10) - Maximum number of events to return
 * - timeMin: ISO string - Start time for events
 * - timeMax: ISO string - End time for events
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax');

    // Check if user has Google Calendar connected
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        googleCalendarSyncEnabled: true,
        googleCalendarId: true,
      },
    });

    if (!dbUser || !dbUser.googleCalendarSyncEnabled) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'Google Calendar not connected',
        events: [],
      });
    }

    const calendarId = dbUser.googleCalendarId || 'primary';

    // Get valid access token
    const accessToken = await getValidAccessToken(user.id);
    const tokens = await getDecryptedTokens(user.id);

    if (!tokens) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'No tokens available',
        events: [],
      });
    }

    // Create Google Calendar client
    const client = createGoogleCalendarClient(accessToken, tokens.refreshToken);

    // Build query parameters
    const params: any = {
      timeMin,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (timeMax) {
      params.timeMax = timeMax;
    }

    // Fetch events from Google Calendar
    const response = await client.listEvents(calendarId, params);

    // Transform events to our format
    const events = (response.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description,
      startTime: event.start?.dateTime || event.start?.date,
      endTime: event.end?.dateTime || event.end?.date,
      isAllDay: !!event.start?.date, // If date instead of dateTime, it's all-day
      location: event.location,
      meetingUrl: event.hangoutLink || extractMeetingUrl(event.description),
      htmlLink: event.htmlLink,
      creator: {
        email: event.creator?.email,
        name: event.creator?.displayName || event.creator?.email,
      },
      organizer: {
        email: event.organizer?.email,
        name: event.organizer?.displayName || event.organizer?.email,
      },
    }));

    logger.info('Fetched Google Calendar events', {
      userId: user.id,
      eventCount: events.length,
    });

    return NextResponse.json({
      success: true,
      connected: true,
      events,
      count: events.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/google-calendar/events failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Google Calendar events',
        events: [],
      },
      { status: 500 }
    );
  }
}

/**
 * Extract meeting URL from event description
 */
function extractMeetingUrl(description?: string): string | undefined {
  if (!description) return undefined;

  // Common meeting URL patterns
  const patterns = [
    /https?:\/\/(?:zoom\.us|[\w-]+\.zoom\.us)\/[^\s]+/i,
    /https?:\/\/(?:meet\.google\.com|[\w-]+\.meet\.google\.com)\/[^\s]+/i,
    /https?:\/\/(?:teams\.microsoft\.com|[\w-]+\.teams\.microsoft\.com)\/[^\s]+/i,
    /https?:\/\/(?:[\w-]+\.webex\.com)\/[^\s]+/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return undefined;
}
