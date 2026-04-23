/**
 * Per-User GitHub Webhook Endpoint
 * Each user has their own unique webhook URL and token
 * URL format: /api/webhooks/github/{userId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { logger } from '@/lib/logger';
import { processGitHubWebhook } from '@/server/activity/githubEventService';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

interface RouteParams {
  params: {
    userId: string;
  };
}

/**
 * Verify GitHub webhook signature using user's specific token
 */
function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    const hmac = createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    // Use timing-safe comparison
    if (digest.length !== signature.length) {
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < digest.length; i++) {
      mismatch |= digest.charCodeAt(i) ^ signature.charCodeAt(i);
    }

    return mismatch === 0;
  } catch (error) {
    logger.error('Signature verification error', error);
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = params.userId;

    // Fetch user's encrypted webhook token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubUsername: true,
        githubWebhookToken: true,
      },
    });

    if (!user) {
      logger.warn('Webhook received for unknown user', { userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.githubWebhookToken) {
      logger.warn('User has no webhook token configured', { userId });
      return NextResponse.json(
        { error: 'Webhook token not configured for this user' },
        { status: 403 }
      );
    }

    // Decrypt user's webhook token
    let webhookSecret: string;
    try {
      webhookSecret = decrypt(user.githubWebhookToken);
    } catch (error) {
      logger.error('Failed to decrypt webhook token', error, { userId });
      return NextResponse.json(
        { error: 'Invalid webhook token configuration' },
        { status: 500 }
      );
    }

    // Get request body and signature
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event');

    // Verify signature using user's specific token
    if (!verifyGitHubSignature(body, signature, webhookSecret)) {
      logger.warn('Invalid webhook signature for user', { userId });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(body);

    // Log webhook received
    logger.info('GitHub webhook received', {
      userId,
      eventType,
      repository: payload.repository?.full_name,
    });

    // Process the webhook event
    await processGitHubWebhook(eventType || 'unknown', payload.action, payload);

    return NextResponse.json({
      success: true,
      received: true,
      userId,
      eventType,
    });
  } catch (error) {
    logger.error('Webhook processing failed', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Allow webhook to work without authentication
export const dynamic = 'force-dynamic';
