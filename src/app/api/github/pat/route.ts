/**
 * GitHub Personal Access Token Management API
 * Save, retrieve, and delete student's GitHub Personal Access Token
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { encrypt, decrypt } from '@/lib/encryption';

/**
 * GET - Retrieve current GitHub PAT status (not the token itself for security)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { githubPersonalAccessToken: true },
    });

    const hasToken = !!dbUser?.githubPersonalAccessToken;

    return NextResponse.json({
      success: true,
      hasToken,
    });
  } catch (error) {
    logger.error('GET /api/github/pat failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve token status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save GitHub Personal Access Token
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token format (GitHub PATs start with ghp_ or github_pat_)
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token format. GitHub Personal Access Tokens should start with "ghp_" or "github_pat_"',
        },
        { status: 400 }
      );
    }

    // Test the token by making a simple API call
    try {
      const testResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired GitHub token. Please verify your token has the correct permissions.',
          },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify token with GitHub',
        },
        { status: 400 }
      );
    }

    // Encrypt and store the token
    const encryptedToken = encrypt(token);

    await prisma.user.update({
      where: { id: user.id },
      data: { githubPersonalAccessToken: encryptedToken },
    });

    logger.info('GitHub Personal Access Token saved', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'GitHub Personal Access Token saved successfully',
    });
  } catch (error) {
    logger.error('POST /api/github/pat failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save token' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove GitHub Personal Access Token
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    await prisma.user.update({
      where: { id: user.id },
      data: { githubPersonalAccessToken: null },
    });

    logger.info('GitHub Personal Access Token deleted', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Token deleted successfully',
    });
  } catch (error) {
    logger.error('DELETE /api/github/pat failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}
