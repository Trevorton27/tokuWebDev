/**
 * GitHub Webhook Handler
 * POST /api/webhooks/github
 *
 * Receives and processes GitHub webhook events for real-time project updates
 *
 * Supported events:
 * - push: Track commits, auto-complete milestones
 * - pull_request: Track PR opens/closes/merges
 * - deployment_status: Track deployment success/failure
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  handlePushEvent,
  handlePullRequestEvent,
  handleDeploymentEvent,
} from '@/server/github/webhookHandlers';

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * POST /api/webhooks/github
 * Handle incoming GitHub webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const deliveryId = request.headers.get('x-github-delivery');

    logger.info('GitHub webhook received', {
      event,
      deliveryId,
      hasSignature: !!signature,
    });

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifyGitHubSignature(body, signature, webhookSecret);
      if (!isValid) {
        logger.warn('Invalid GitHub webhook signature', { deliveryId });
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      logger.warn('GITHUB_WEBHOOK_SECRET not configured - skipping signature verification');
    }

    const payload = JSON.parse(body);

    // Route to appropriate handler based on event type
    let result;
    switch (event) {
      case 'push':
        result = await handlePushEvent(payload);
        break;

      case 'pull_request':
        result = await handlePullRequestEvent(payload);
        break;

      case 'deployment_status':
        result = await handleDeploymentEvent(payload);
        break;

      case 'ping':
        logger.info('GitHub webhook ping received');
        return NextResponse.json({
          success: true,
          message: 'Pong! Webhook is configured correctly.',
        });

      default:
        logger.info('Unhandled GitHub webhook event', { event });
        return NextResponse.json({
          success: true,
          message: \`Event type '\${event}' received but not handled\`,
        });
    }

    return NextResponse.json({
      success: true,
      event,
      deliveryId,
      result,
    });
  } catch (error) {
    logger.error('GitHub webhook processing failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
