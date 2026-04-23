/**
 * Connected Repositories Management API
 * Manage which repositories are connected to student profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET - List connected repositories
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const connectedRepos = await prisma.connectedRepository.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        connectedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      repositories: connectedRepos.map((repo) => ({
        id: repo.id,
        name: repo.repoName,
        url: repo.repoUrl,
        connectedAt: repo.connectedAt,
        metadata: repo.metadata,
      })),
      total: connectedRepos.length,
    });
  } catch (error) {
    logger.error('GET /api/github/connected-repos failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connected repositories' },
      { status: 500 }
    );
  }
}

/**
 * POST - Connect a repository
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { repoName, repoUrl, metadata } = body;

    // Validate required fields
    if (!repoName || !repoUrl) {
      return NextResponse.json(
        { success: false, error: 'repoName and repoUrl are required' },
        { status: 400 }
      );
    }

    // Check if repository is already connected
    const existing = await prisma.connectedRepository.findFirst({
      where: {
        userId: user.id,
        repoName,
      },
    });

    if (existing) {
      // Reactivate if it was previously disconnected
      const updated = await prisma.connectedRepository.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          repoUrl,
          metadata: metadata || existing.metadata,
        },
      });

      return NextResponse.json({
        success: true,
        repository: {
          id: updated.id,
          name: updated.repoName,
          url: updated.repoUrl,
          connectedAt: updated.connectedAt,
        },
        message: 'Repository reconnected successfully',
      });
    }

    // Create new connection
    const connected = await prisma.connectedRepository.create({
      data: {
        userId: user.id,
        repoName,
        repoUrl,
        metadata: metadata || {},
        isActive: true,
      },
    });

    logger.info('Repository connected', {
      userId: user.id,
      repoName,
    });

    return NextResponse.json({
      success: true,
      repository: {
        id: connected.id,
        name: connected.repoName,
        url: connected.repoUrl,
        connectedAt: connected.connectedAt,
      },
      message: 'Repository connected successfully',
    });
  } catch (error) {
    logger.error('POST /api/github/connected-repos failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect repository' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Disconnect a repository
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('id');
    const repoName = searchParams.get('name');

    if (!repoId && !repoName) {
      return NextResponse.json(
        { success: false, error: 'Either id or name parameter is required' },
        { status: 400 }
      );
    }

    // Find the repository
    const repo = await prisma.connectedRepository.findFirst({
      where: {
        userId: user.id,
        ...(repoId ? { id: repoId } : repoName ? { repoName } : {}),
      },
    });

    if (!repo) {
      return NextResponse.json(
        { success: false, error: 'Repository not found' },
        { status: 404 }
      );
    }

    // Mark as inactive (soft delete)
    await prisma.connectedRepository.update({
      where: { id: repo.id },
      data: { isActive: false },
    });

    logger.info('Repository disconnected', {
      userId: user.id,
      repoName: repo.repoName,
    });

    return NextResponse.json({
      success: true,
      message: 'Repository disconnected successfully',
    });
  } catch (error) {
    logger.error('DELETE /api/github/connected-repos failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect repository' },
      { status: 500 }
    );
  }
}
