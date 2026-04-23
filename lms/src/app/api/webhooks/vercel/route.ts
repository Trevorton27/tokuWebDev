/**
 * Vercel Deployment Webhook Handler
 * POST /api/webhooks/vercel
 *
 * Receives deployment notifications from Vercel to update project deployment status
 *
 * Setup:
 * 1. Go to Vercel Project Settings > Webhooks
 * 2. Create webhook with URL: https://yourdomain.com/api/webhooks/vercel
 * 3. Select events: deployment.created, deployment.succeeded, deployment.failed
 * 4. Add VERCEL_WEBHOOK_SECRET to your .env
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

/**
 * Verify Vercel webhook signature
 * Vercel uses x-vercel-signature header with SHA1 HMAC
 */
function verifyVercelSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const hmac = crypto.createHmac('sha1', secret);
  const digest = hmac.update(payload).digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/**
 * POST /api/webhooks/vercel
 * Handle incoming Vercel webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-vercel-signature');

    logger.info('Vercel webhook received', {
      hasSignature: !!signature,
    });

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifyVercelSignature(body, signature, webhookSecret);
      if (!isValid) {
        logger.warn('Invalid Vercel webhook signature');
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      logger.warn('VERCEL_WEBHOOK_SECRET not configured - skipping signature verification');
    }

    const payload = JSON.parse(body);
    const { type, deployment } = payload;

    if (!deployment) {
      logger.warn('Vercel webhook missing deployment data');
      return NextResponse.json(
        { success: false, error: 'Missing deployment data' },
        { status: 400 }
      );
    }

    // Extract deployment info
    const deploymentUrl = deployment.url ? `https://${deployment.url}` : null;
    const repoUrl = deployment.meta?.githubRepo;
    const repoFullName = repoUrl ? repoUrl.replace('https://github.com/', '') : null;
    const state = deployment.readyState || deployment.state;

    logger.info('Processing Vercel deployment webhook', {
      type,
      deploymentUrl,
      repoFullName,
      state,
    });

    // Find project by GitHub repo URL
    if (!repoFullName) {
      logger.info('No GitHub repo associated with deployment');
      return NextResponse.json({
        success: true,
        message: 'No GitHub repo linked - skipping project update',
      });
    }

    const project = await prisma.studentProject.findFirst({
      where: { repoFullName },
    });

    if (!project) {
      logger.info('No project found for repository', { repoFullName });
      return NextResponse.json({
        success: true,
        message: 'No project linked to this repository',
      });
    }

    // Map Vercel deployment state to our enum
    let deploymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | undefined;
    let activityType: 'DEPLOYMENT_SUCCESS' | 'DEPLOYMENT_FAILED' | undefined;
    let activityTitle: string | undefined;

    switch (state) {
      case 'READY':
      case 'ready':
        deploymentStatus = 'SUCCESS';
        activityType = 'DEPLOYMENT_SUCCESS';
        activityTitle = 'Deployment succeeded';
        break;
      case 'ERROR':
      case 'error':
      case 'CANCELED':
      case 'canceled':
        deploymentStatus = 'FAILED';
        activityType = 'DEPLOYMENT_FAILED';
        activityTitle = 'Deployment failed';
        break;
      case 'BUILDING':
      case 'building':
      case 'QUEUED':
      case 'queued':
      case 'INITIALIZING':
      case 'initializing':
        deploymentStatus = 'PENDING';
        // Don't create activity for pending states
        break;
      default:
        logger.info('Unknown deployment state', { state });
        deploymentStatus = 'PENDING';
    }

    // Update project deployment status
    await prisma.studentProject.update({
      where: { id: project.id },
      data: {
        lastDeployment: new Date(),
        deploymentUrl: deploymentUrl || project.deploymentUrl,
        deploymentStatus,
        lastSyncedAt: new Date(),
      },
    });

    // Create activity record for successful/failed deployments
    if (activityType && activityTitle) {
      await prisma.projectActivity.create({
        data: {
          projectId: project.id,
          activityType,
          title: activityTitle,
          description: `Deployed to ${deployment.url || 'Vercel'}`,
          metadata: {
            deploymentId: deployment.id,
            state,
            environment: deployment.target || 'production',
          },
          url: deploymentUrl,
          timestamp: new Date(),
        },
      });
    }

    logger.info('Vercel deployment processed', {
      projectId: project.id,
      status: deploymentStatus,
      url: deploymentUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Deployment webhook processed',
      projectId: project.id,
      deploymentStatus,
    });
  } catch (error) {
    logger.error('Vercel webhook processing failed', error);
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
