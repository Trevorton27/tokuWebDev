/**
 * GitHub Webhook Token Management API
 * Generate, retrieve, and regenerate encrypted webhook tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
  encrypt,
  decrypt,
  generateWebhookToken,
} from '@/lib/encryption';

/**
 * GET - Retrieve current webhook token (decrypted)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { githubWebhookToken: true },
    });

    if (!dbUser?.githubWebhookToken) {
      return NextResponse.json(
        { success: false, error: 'No webhook token configured' },
        { status: 404 }
      );
    }

    // Decrypt the token
    const decryptedToken = decrypt(dbUser.githubWebhookToken);

    return NextResponse.json({
      success: true,
      token: decryptedToken,
    });
  } catch (error) {
    logger.error('GET /api/github/token failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve token' },
      { status: 500 }
    );
  }
}

/**
 * POST - Generate new webhook token
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { regenerate } = body;

    // Check if token already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { githubWebhookToken: true },
    });

    if (existingUser?.githubWebhookToken && !regenerate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook token already exists. Use regenerate=true to create a new one.',
        },
        { status: 400 }
      );
    }

    // Generate new token
    const newToken = generateWebhookToken(32);

    // Encrypt and store
    const encryptedToken = encrypt(newToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { githubWebhookToken: encryptedToken },
    });

    logger.info('GitHub webhook token generated', {
      userId: user.id,
      regenerate: !!regenerate,
    });

    return NextResponse.json({
      success: true,
      token: newToken,
      message: regenerate ? 'Token regenerated successfully' : 'Token generated successfully',
    });
  } catch (error) {
    logger.error('POST /api/github/token failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove webhook token
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    await prisma.user.update({
      where: { id: user.id },
      data: { githubWebhookToken: null },
    });

    logger.info('GitHub webhook token deleted', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Token deleted successfully',
    });
  } catch (error) {
    logger.error('DELETE /api/github/token failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}
