/**
 * Session Tracking Service
 * Manages login sessions, activity tracking, and session duration calculations
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { hashIP } from '@/lib/webhookSecurity';
import { parseDeviceType, parseBrowser } from '@/lib/deviceParser';
import type { LoginSession } from '@prisma/client';

interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create a new login session
 * @param userId - User ID
 * @param sessionToken - Optional session token for deduplication
 * @param context - Request context (IP, user-agent)
 * @returns Created login session
 */
export async function createLoginSession(
  userId: string,
  sessionToken?: string,
  context?: RequestContext
): Promise<LoginSession> {
  try {
    const ipAddress = context?.ipAddress || null;
    const userAgent = context?.userAgent || null;
    const deviceType = parseDeviceType(userAgent);
    const browser = parseBrowser(userAgent);

    // End any other active sessions for this user before creating new one
    // This prevents multiple active sessions accumulating
    const closedSessions = await prisma.loginSession.updateMany({
      where: {
        userId,
        isActive: true,
        sessionToken: { not: sessionToken || null },
      },
      data: {
        logoutAt: new Date(),
        isActive: false,
      },
    });

    if (closedSessions.count > 0) {
      logger.info('Closed previous active sessions', {
        userId,
        count: closedSessions.count,
      });
    }

    const session = await prisma.loginSession.create({
      data: {
        userId,
        sessionToken: sessionToken || null,
        ipAddress: hashIP(ipAddress),
        userAgent,
        deviceType,
        browser,
        isActive: true,
      },
    });

    // Update user's lastActiveAt
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });

    logger.info('Login session created', {
      userId,
      sessionId: session.id,
      deviceType,
      browser,
    });

    return session;
  } catch (error) {
    logger.error('Failed to create login session', error, { userId });
    throw new Error('Failed to create login session');
  }
}

/**
 * Update session activity timestamp
 * Throttled to once per 5 minutes per session to reduce DB load
 * @param userId - User ID
 * @param sessionToken - Optional session token
 */
export async function updateSessionActivity(
  userId: string,
  sessionToken?: string
): Promise<void> {
  try {
    // Check if session was updated recently (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const recentUpdate = await prisma.loginSession.findFirst({
      where: {
        userId,
        sessionToken: sessionToken || null,
        isActive: true,
        lastActivity: { gte: fiveMinutesAgo },
      },
    });

    // Skip update if session was updated recently
    if (recentUpdate) {
      return;
    }

    // Update all active sessions for this user (or specific session if token provided)
    const updated = await prisma.loginSession.updateMany({
      where: {
        userId,
        isActive: true,
        ...(sessionToken && { sessionToken }),
      },
      data: {
        lastActivity: new Date(),
      },
    });

    if (updated.count > 0) {
      // Also update user's lastActiveAt
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
    }
  } catch (error) {
    logger.error('Failed to update session activity', error, { userId });
    // Don't throw - this is a background operation
  }
}

/**
 * End a login session
 * @param userId - User ID
 * @param sessionToken - Optional session token
 */
export async function endLoginSession(
  userId: string,
  sessionToken?: string
): Promise<void> {
  try {
    await prisma.loginSession.updateMany({
      where: {
        userId,
        isActive: true,
        ...(sessionToken && { sessionToken }),
      },
      data: {
        logoutAt: new Date(),
        isActive: false,
      },
    });

    logger.info('Login session ended', { userId, sessionToken });
  } catch (error) {
    logger.error('Failed to end login session', error, { userId });
    throw new Error('Failed to end login session');
  }
}

/**
 * Get login sessions for a user
 * @param userId - User ID
 * @param options - Query options (limit, startDate, endDate)
 * @returns Array of login sessions
 */
export async function getLoginSessions(
  userId: string,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<LoginSession[]> {
  try {
    const sessions = await prisma.loginSession.findMany({
      where: {
        userId,
        ...(options?.startDate && {
          loginAt: {
            gte: options.startDate,
            ...(options?.endDate && { lte: options.endDate }),
          },
        }),
      },
      orderBy: {
        loginAt: 'desc',
      },
      take: options?.limit || 20,
    });

    return sessions;
  } catch (error) {
    logger.error('Failed to get login sessions', error, { userId });
    throw new Error('Failed to retrieve login sessions');
  }
}

/**
 * Calculate session duration in seconds
 * @param session - Login session
 * @returns Duration in seconds
 */
export function calculateSessionDuration(session: LoginSession): number {
  const endTime = session.logoutAt || session.lastActivity;
  const startTime = session.loginAt;

  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Get session statistics for a user
 * @param userId - User ID
 * @param days - Number of days to look back
 * @returns Session statistics
 */
export async function getSessionStatistics(
  userId: string,
  days: number = 7
): Promise<{
  totalSessions: number;
  totalDuration: number;
  avgDuration: number;
  activeSessions: number;
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await prisma.loginSession.findMany({
      where: {
        userId,
        loginAt: { gte: startDate },
      },
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce(
      (sum, session) => sum + calculateSessionDuration(session),
      0
    );
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const activeSessions = sessions.filter((s) => s.isActive).length;

    return {
      totalSessions,
      totalDuration,
      avgDuration,
      activeSessions,
    };
  } catch (error) {
    logger.error('Failed to get session statistics', error, { userId });
    throw new Error('Failed to calculate session statistics');
  }
}

/**
 * End stale sessions (inactive for more than 30 minutes)
 * Should be run periodically as a cleanup job
 */
export async function endStaleSessions(): Promise<number> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const result = await prisma.loginSession.updateMany({
      where: {
        isActive: true,
        lastActivity: { lt: thirtyMinutesAgo },
      },
      data: {
        isActive: false,
        logoutAt: new Date(),
      },
    });

    logger.info('Ended stale sessions', { count: result.count });
    return result.count;
  } catch (error) {
    logger.error('Failed to end stale sessions', error);
    return 0;
  }
}
