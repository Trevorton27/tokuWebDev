/**
 * Google Calendar API Client
 * Handles all interactions with Google Calendar API
 * Pattern: Similar to githubApiClient.ts
 */

import { google, calendar_v3 } from 'googleapis';
import { logger } from '@/lib/logger';

// Custom error classes for better error handling
export class GoogleCalendarError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GoogleCalendarError';
  }
}

export class GoogleCalendarAuthError extends GoogleCalendarError {
  constructor(message: string = 'Google Calendar authentication failed') {
    super(message, 401);
    this.name = 'GoogleCalendarAuthError';
  }
}

export class GoogleCalendarRateLimitError extends GoogleCalendarError {
  constructor(
    message: string = 'Google Calendar rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 429);
    this.name = 'GoogleCalendarRateLimitError';
  }
}

export class GoogleCalendarNotFoundError extends GoogleCalendarError {
  constructor(message: string = 'Calendar event not found') {
    super(message, 404);
    this.name = 'GoogleCalendarNotFoundError';
  }
}

/**
 * Google Calendar API Client Class
 */
export class GoogleCalendarClient {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  private calendar: calendar_v3.Calendar;

  /**
   * Create a new Google Calendar client
   * @param accessToken - OAuth access token
   * @param refreshToken - OAuth refresh token
   */
  constructor(accessToken: string, refreshToken: string) {
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Initialize Calendar API
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });
  }

  /**
   * Create an event in Google Calendar
   * @param calendarId - Calendar ID (usually "primary")
   * @param event - Event data
   * @returns Created event
   */
  async createEvent(
    calendarId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      logger.info('Creating Google Calendar event', {
        calendarId,
        summary: event.summary,
      });

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      if (!response.data) {
        throw new GoogleCalendarError('No data returned from Google Calendar');
      }

      logger.info('Google Calendar event created successfully', {
        eventId: response.data.id,
        summary: response.data.summary,
      });

      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'create event');
    }
  }

  /**
   * Update an existing event in Google Calendar
   * @param calendarId - Calendar ID
   * @param eventId - Google Calendar event ID
   * @param event - Updated event data
   * @returns Updated event
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    try {
      logger.info('Updating Google Calendar event', {
        calendarId,
        eventId,
        summary: event.summary,
      });

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });

      if (!response.data) {
        throw new GoogleCalendarError('No data returned from Google Calendar');
      }

      logger.info('Google Calendar event updated successfully', {
        eventId: response.data.id,
        summary: response.data.summary,
      });

      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'update event');
    }
  }

  /**
   * Delete an event from Google Calendar
   * @param calendarId - Calendar ID
   * @param eventId - Google Calendar event ID
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      logger.info('Deleting Google Calendar event', {
        calendarId,
        eventId,
      });

      await this.calendar.events.delete({
        calendarId,
        eventId,
      });

      logger.info('Google Calendar event deleted successfully', {
        eventId,
      });
    } catch (error: any) {
      // If event doesn't exist, that's OK (already deleted)
      if (error.response?.status === 404 || error.response?.status === 410) {
        logger.warn('Event already deleted or not found', { eventId });
        return;
      }
      return this.handleError(error, 'delete event');
    }
  }

  /**
   * Get an event from Google Calendar
   * @param calendarId - Calendar ID
   * @param eventId - Google Calendar event ID
   * @returns Event data
   */
  async getEvent(
    calendarId: string,
    eventId: string
  ): Promise<calendar_v3.Schema$Event> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      if (!response.data) {
        throw new GoogleCalendarError('No data returned from Google Calendar');
      }

      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'get event');
    }
  }

  /**
   * List events from Google Calendar
   * @param calendarId - Calendar ID
   * @param options - Query options (timeMin, timeMax, etc.)
   * @returns List of events
   */
  async listEvents(
    calendarId: string,
    options?: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
    }
  ): Promise<calendar_v3.Schema$Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: options?.timeMin,
        timeMax: options?.timeMax,
        maxResults: options?.maxResults || 250,
        singleEvents: options?.singleEvents !== false, // Default to true
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      return this.handleError(error, 'list events');
    }
  }

  /**
   * Get user's primary calendar
   * @returns Calendar metadata
   */
  async getPrimaryCalendar(): Promise<calendar_v3.Schema$Calendar> {
    try {
      const response = await this.calendar.calendars.get({
        calendarId: 'primary',
      });

      if (!response.data) {
        throw new GoogleCalendarError('No calendar data returned');
      }

      return response.data;
    } catch (error: any) {
      return this.handleError(error, 'get calendar');
    }
  }

  /**
   * Refresh the OAuth access token
   * @returns New access token and expiry
   */
  async refreshAccessToken(): Promise<{ accessToken: string; expiry: Date }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token || !credentials.expiry_date) {
        throw new GoogleCalendarAuthError('Failed to refresh token');
      }

      // Update client credentials
      this.oauth2Client.setCredentials(credentials);

      return {
        accessToken: credentials.access_token,
        expiry: new Date(credentials.expiry_date),
      };
    } catch (error: any) {
      logger.error('Failed to refresh Google Calendar token', error);
      throw new GoogleCalendarAuthError('Token refresh failed');
    }
  }

  /**
   * Handle API errors with retry logic and proper error types
   * @param error - Error from Google Calendar API
   * @param operation - Operation being performed (for logging)
   * @throws Appropriate error type
   */
  private handleError(error: any, operation: string): never {
    const status = error.response?.status || error.code;
    const message = error.message || 'Unknown error';

    logger.error(`Google Calendar ${operation} failed`, error, {
      status,
      message,
    });

    // Handle specific error codes
    switch (status) {
      case 401:
      case 'UNAUTHENTICATED':
        throw new GoogleCalendarAuthError(
          `Authentication failed while trying to ${operation}`
        );

      case 403:
        // Check if it's a rate limit error
        if (
          message.includes('rate') ||
          message.includes('quota') ||
          message.includes('limit')
        ) {
          const retryAfter = error.response?.headers?.['retry-after'];
          throw new GoogleCalendarRateLimitError(
            `Rate limit exceeded while trying to ${operation}`,
            retryAfter ? parseInt(retryAfter) : undefined
          );
        }
        throw new GoogleCalendarError(
          `Permission denied while trying to ${operation}`,
          403
        );

      case 404:
      case 410: // Gone
        throw new GoogleCalendarNotFoundError(
          `Resource not found while trying to ${operation}`
        );

      case 500:
      case 502:
      case 503:
        throw new GoogleCalendarError(
          `Google Calendar service error while trying to ${operation}. Please try again later.`,
          status
        );

      default:
        throw new GoogleCalendarError(
          `Failed to ${operation}: ${message}`,
          status
        );
    }
  }
}

/**
 * Retry a Google Calendar operation with exponential backoff
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retries (default 3)
 * @returns Result of operation
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Only retry on rate limit or temporary errors
      if (
        error instanceof GoogleCalendarRateLimitError ||
        (error instanceof GoogleCalendarError && error.statusCode && error.statusCode >= 500)
      ) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s

        logger.warn('Retrying Google Calendar operation', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: error.message,
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Don't retry other errors
      throw error;
    }
  }

  // All retries exhausted
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Create a Google Calendar client with valid credentials
 * @param accessToken - OAuth access token
 * @param refreshToken - OAuth refresh token
 * @returns GoogleCalendarClient instance
 */
export function createGoogleCalendarClient(
  accessToken: string,
  refreshToken: string
): GoogleCalendarClient {
  return new GoogleCalendarClient(accessToken, refreshToken);
}
