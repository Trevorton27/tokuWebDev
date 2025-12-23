/**
 * GitHub Webhook Endpoint
 * Receives and processes GitHub webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubSignature } from '@/lib/webhookSecurity';
import { processGitHubWebhook } from '@/server/activity/githubEventService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const eventType = request.headers.get('x-github-event');

    // Verify webhook signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
    if (!verifyGitHubSignature(body, signature, secret)) {
      logger.warn('Invalid GitHub webhook signature', {
        eventType,
        hasSignature: !!signature,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(body);
    const action = payload.action;

    logger.info('GitHub webhook received', {
      eventType,
      action,
      repository: payload.repository?.full_name,
    });

    // Process webhook asynchronously (non-blocking)
    // This allows us to return 200 quickly to avoid GitHub timeout
    processGitHubWebhook(eventType || 'unknown', action, payload).catch(
      (err) => {
        logger.error('Failed to process GitHub webhook', err, {
          eventType,
          action,
        });
      }
    );

    // Return success immediately
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    logger.error('GitHub webhook endpoint error', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'GitHub webhook endpoint is active',
  });
}
