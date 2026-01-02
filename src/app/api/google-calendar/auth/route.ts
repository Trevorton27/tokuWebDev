/**
 * Google Calendar OAuth - Initiate Flow
 * GET /api/google-calendar/auth
 * Redirects user to Google consent screen
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Validate environment variables
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      logger.error('Google Calendar OAuth environment variables not configured');
      return NextResponse.json(
        { success: false, error: 'Google Calendar integration not configured' },
        { status: 500 }
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/cookie (you could also use a Redis cache)
    // For now, we'll encode the userId in the state for simplicity
    // In production, consider using a more secure approach
    const stateWithUser = Buffer.from(JSON.stringify({ state, userId: user.id })).toString('base64');

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Gets refresh token
      scope: [
        'https://www.googleapis.com/auth/calendar.events', // Manage calendar events
        'https://www.googleapis.com/auth/userinfo.email', // Get user email
      ],
      state: stateWithUser,
      prompt: 'consent', // Force consent to ensure we get refresh token
    });

    logger.info('Google Calendar OAuth flow initiated', { userId: user.id });

    // Redirect to Google consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('Google Calendar OAuth initiation failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Google Calendar connection' },
      { status: 500 }
    );
  }
}
