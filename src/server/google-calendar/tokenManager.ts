/**
 * Google Calendar OAuth Token Manager
 * Handles encryption, decryption, and lifecycle management of Google OAuth tokens
 */

import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { logger } from '@/lib/logger';

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiry: Date;
}

export interface TokenRefreshResult {
  accessToken: string;
  expiry: Date;
}

/**
 * Get decrypted Google OAuth tokens for a user
 * @param userId - User ID
 * @returns Decrypted tokens or null if not connected
 */
export async function getDecryptedTokens(userId: string): Promise<GoogleTokens | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
        googleCalendarSyncEnabled: true,
      },
    });

    if (!user || !user.googleCalendarSyncEnabled) {
      return null;
    }

    if (!user.googleAccessToken || !user.googleRefreshToken) {
      logger.warn('User has sync enabled but missing tokens', { userId });
      return null;
    }

    // Decrypt tokens
    const accessToken = decrypt(user.googleAccessToken);
    const refreshToken = decrypt(user.googleRefreshToken);

    return {
      accessToken,
      refreshToken,
      expiry: user.googleTokenExpiry || new Date(),
    };
  } catch (error) {
    logger.error('Failed to get decrypted tokens', error, { userId });
    throw new Error('Failed to retrieve Google Calendar tokens');
  }
}

/**
 * Store encrypted Google OAuth tokens for a user
 * @param userId - User ID
 * @param tokens - Google OAuth tokens to encrypt and store
 */
export async function storeEncryptedTokens(
  userId: string,
  tokens: GoogleTokens
): Promise<void> {
  try {
    // Encrypt tokens before storage
    const encryptedAccessToken = encrypt(tokens.accessToken);
    const encryptedRefreshToken = encrypt(tokens.refreshToken);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        googleTokenExpiry: tokens.expiry,
        googleCalendarSyncEnabled: true,
        googleCalendarId: 'primary', // Default to primary calendar
      },
    });

    logger.info('Google Calendar tokens stored successfully', {
      userId,
      expiry: tokens.expiry,
    });
  } catch (error) {
    logger.error('Failed to store encrypted tokens', error, { userId });
    throw new Error('Failed to store Google Calendar tokens');
  }
}

/**
 * Check if a user's access token is expired or about to expire
 * @param userId - User ID
 * @returns True if token is expired or expiring within 5 minutes
 */
export async function isTokenExpired(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleTokenExpiry: true },
    });

    if (!user || !user.googleTokenExpiry) {
      return true;
    }

    // Consider expired if expiring within 5 minutes (buffer for safety)
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    const expiryWithBuffer = new Date(user.googleTokenExpiry.getTime() - bufferMs);

    return now >= expiryWithBuffer;
  } catch (error) {
    logger.error('Failed to check token expiry', error, { userId });
    return true; // Assume expired on error
  }
}

/**
 * Refresh a user's Google OAuth access token using refresh token
 * @param userId - User ID
 * @returns New access token and expiry
 * @throws Error if refresh fails
 */
export async function refreshUserToken(userId: string): Promise<TokenRefreshResult> {
  try {
    const tokens = await getDecryptedTokens(userId);
    if (!tokens) {
      throw new Error('No tokens found for user');
    }

    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set refresh token
    oauth2Client.setCredentials({
      refresh_token: tokens.refreshToken,
    });

    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token || !credentials.expiry_date) {
      throw new Error('Failed to refresh token - no credentials returned');
    }

    const newTokens: GoogleTokens = {
      accessToken: credentials.access_token,
      refreshToken: tokens.refreshToken, // Refresh token doesn't change
      expiry: new Date(credentials.expiry_date),
    };

    // Store new tokens
    await storeEncryptedTokens(userId, newTokens);

    logger.info('Google Calendar token refreshed successfully', {
      userId,
      newExpiry: newTokens.expiry,
    });

    return {
      accessToken: newTokens.accessToken,
      expiry: newTokens.expiry,
    };
  } catch (error) {
    logger.error('Failed to refresh Google Calendar token', error, { userId });

    // If refresh fails, disable sync and notify user
    await disableSync(userId);

    throw new Error(
      'Failed to refresh Google Calendar token. Please reconnect your Google Calendar.'
    );
  }
}

/**
 * Get a valid (non-expired) access token, refreshing if necessary
 * @param userId - User ID
 * @returns Valid access token
 * @throws Error if unable to get valid token
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  try {
    const expired = await isTokenExpired(userId);

    if (expired) {
      logger.info('Token expired, refreshing', { userId });
      const result = await refreshUserToken(userId);
      return result.accessToken;
    }

    const tokens = await getDecryptedTokens(userId);
    if (!tokens) {
      throw new Error('No tokens available');
    }

    return tokens.accessToken;
  } catch (error) {
    logger.error('Failed to get valid access token', error, { userId });
    throw error;
  }
}

/**
 * Disable Google Calendar sync for a user
 * Clears tokens and sets sync to false
 * @param userId - User ID
 */
export async function disableSync(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarSyncEnabled: false,
        // Keep tokens for potential reconnection
        // googleAccessToken: null,
        // googleRefreshToken: null,
        // googleTokenExpiry: null,
      },
    });

    logger.info('Google Calendar sync disabled', { userId });
  } catch (error) {
    logger.error('Failed to disable sync', error, { userId });
    throw new Error('Failed to disable Google Calendar sync');
  }
}

/**
 * Completely disconnect Google Calendar (remove all tokens)
 * @param userId - User ID
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarSyncEnabled: false,
        googleCalendarId: null,
        googleCalendarLastSync: null,
      },
    });

    logger.info('Google Calendar disconnected', { userId });
  } catch (error) {
    logger.error('Failed to disconnect Google Calendar', error, { userId });
    throw new Error('Failed to disconnect Google Calendar');
  }
}

/**
 * Update last sync timestamp for a user
 * @param userId - User ID
 */
export async function updateLastSyncTime(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarLastSync: new Date(),
      },
    });
  } catch (error) {
    logger.error('Failed to update last sync time', error, { userId });
    // Non-critical error, don't throw
  }
}
