/**
 * Google Calendar OAuth - Callback Handler
 * GET /api/google-calendar/callback
 * Handles OAuth callback from Google, exchanges code for tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { logger } from '@/lib/logger';
import { storeEncryptedTokens, GoogleTokens } from '@/server/google-calendar/tokenManager';
import { batchSyncEvents } from '@/server/google-calendar/syncService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      logger.warn('Google Calendar OAuth denied by user', { error });
      return NextResponse.redirect(
        new URL('/student/settings?error=google_calendar_denied', request.url)
      );
    }

    if (!code || !state) {
      logger.error('Missing code or state in OAuth callback');
      return NextResponse.redirect(
        new URL('/student/settings?error=invalid_callback', request.url)
      );
    }

    // Validate state and extract userId
    let userId: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = decoded.userId;

      if (!userId) {
        throw new Error('No userId in state');
      }
    } catch (err) {
      logger.error('Invalid state parameter in OAuth callback', err);
      return NextResponse.redirect(
        new URL('/student/settings?error=invalid_state', request.url)
      );
    }

    // Validate environment variables
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_REDIRECT_URI
    ) {
      logger.error('Google Calendar OAuth environment variables not configured');
      return NextResponse.redirect(
        new URL('/student/settings?error=config_error', request.url)
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      logger.error('Incomplete tokens received from Google', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        hasExpiry: !!tokens.expiry_date,
      });
      return NextResponse.redirect(
        new URL('/student/settings?error=incomplete_tokens', request.url)
      );
    }

    // Store encrypted tokens
    const googleTokens: GoogleTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiry: new Date(tokens.expiry_date),
    };

    await storeEncryptedTokens(userId, googleTokens);

    logger.info('Google Calendar connected successfully', {
      userId,
      expiry: googleTokens.expiry,
    });

    // Trigger initial batch sync (async, don't wait)
    batchSyncEvents(userId)
      .then((result) => {
        logger.info('Initial batch sync completed', { userId, result });
      })
      .catch((err) => {
        logger.error('Initial batch sync failed', err, { userId });
      });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/student/settings?success=google_calendar_connected', request.url)
    );
  } catch (error: any) {
    logger.error('Google Calendar OAuth callback failed', error);

    // Redirect to error page
    return NextResponse.redirect(
      new URL(
        `/student/settings?error=${encodeURIComponent(error.message || 'callback_failed')}`,
        request.url
      )
    );
  }
}
