/**
 * Session Start API
 * Track user login events
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createLoginSession,
  updateSessionActivity,
} from '@/server/activity/sessionTrackingService';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const sessionToken = body.sessionToken;

    // Extract request context
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    // Check if session with this token already exists and is active
    const existingSession = sessionToken
      ? await prisma.loginSession.findFirst({
          where: {
            userId: user.id,
            sessionToken,
            isActive: true,
          },
        })
      : null;

    if (existingSession) {
      // Session exists - just update activity (with 5min throttle)
      await updateSessionActivity(user.id, sessionToken);
      return NextResponse.json({
        success: true,
        action: 'updated',
        sessionId: existingSession.id,
      });
    } else {
      // New session - create it
      const session = await createLoginSession(user.id, sessionToken, {
        ipAddress,
        userAgent,
      });
      return NextResponse.json({
        success: true,
        action: 'created',
        sessionId: session.id,
      });
    }
  } catch (error) {
    logger.error('POST /api/auth/session-start failed', error);

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to start session' },
      { status: 500 }
    );
  }
}
