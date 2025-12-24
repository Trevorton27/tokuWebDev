/**
 * GitHub Profile Configuration API
 * Update GitHub username and email
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyGitHubUser } from '@/server/github/githubApiClient';

/**
 * GET - Retrieve current GitHub profile settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        githubUsername: true,
        githubEmail: true,
        githubRepoUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        username: dbUser?.githubUsername || null,
        email: dbUser?.githubEmail || null,
        repoUrl: dbUser?.githubRepoUrl || null,
      },
    });
  } catch (error) {
    logger.error('GET /api/github/profile failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update GitHub profile settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { username, email, repoUrl } = body;

    // Validate username if provided
    if (username) {
      if (typeof username !== 'string' || username.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid username format' },
          { status: 400 }
        );
      }

      // Verify GitHub username exists
      const usernameExists = await verifyGitHubUser(username.trim());
      if (!usernameExists) {
        return NextResponse.json(
          {
            success: false,
            error: `GitHub user '${username}' not found`,
          },
          { status: 404 }
        );
      }

      // Check if username is already used by another LMS user
      const existingUser = await prisma.user.findFirst({
        where: {
          githubUsername: {
            equals: username.trim(),
            mode: 'insensitive',
          },
          id: { not: user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'This GitHub username is already linked to another account',
          },
          { status: 409 }
        );
      }
    }

    // Validate email if provided
    if (email && typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Update profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(username !== undefined && { githubUsername: username?.trim() || null }),
        ...(email !== undefined && { githubEmail: email?.trim() || null }),
        ...(repoUrl !== undefined && { githubRepoUrl: repoUrl?.trim() || null }),
      },
      select: {
        githubUsername: true,
        githubEmail: true,
        githubRepoUrl: true,
      },
    });

    logger.info('GitHub profile updated', {
      userId: user.id,
      username: updatedUser.githubUsername,
    });

    return NextResponse.json({
      success: true,
      profile: {
        username: updatedUser.githubUsername,
        email: updatedUser.githubEmail,
        repoUrl: updatedUser.githubRepoUrl,
      },
      message: 'GitHub profile updated successfully',
    });
  } catch (error) {
    logger.error('PUT /api/github/profile failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
