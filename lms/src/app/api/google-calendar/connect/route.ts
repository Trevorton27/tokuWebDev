import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { google } from 'googleapis';
import { logger } from '@/lib/logger';
import { encrypt } from '@/lib/encryption';

/**
 * GET /api/google-calendar/connect
 *
 * Initiates OAuth flow for Google Calendar integration
 * Redirects user to Google OAuth consent screen
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Generate CSRF state token with encrypted user ID and timestamp
    const statePayload = JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    });
    const state = Buffer.from(encrypt(statePayload)).toString('base64url');

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: [
        'https://www.googleapis.com/auth/calendar', // Full calendar access (read/write)
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state,
      prompt: 'consent' // Force consent screen to ensure refresh token
    });

    logger.info('Google Calendar OAuth initiation', { userId: user.id });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.redirect(
        new URL('/sign-in?redirect_url=/settings', request.url)
      );
    }

    logger.error('OAuth initiation failed', error);
    return NextResponse.redirect(
      new URL('/settings?error=oauth_init_failed', request.url)
    );
  }
}
