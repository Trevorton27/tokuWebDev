/**
 * POST /api/student/projects/[id]/sync
 * Manually trigger a GitHub sync for a specific project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { syncProjectWithGitHub } from '@/server/github/projectSyncService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id: projectId } = params;

    // Verify project belongs to user
    const project = await prisma.studentProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to sync this project' },
        { status: 403 }
      );
    }

    logger.info('Manual project sync triggered', { userId: user.id, projectId });

    // Trigger sync
    const syncResult = await syncProjectWithGitHub(projectId);

    if (!syncResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: syncResult.error || 'Sync failed',
        },
        { status: 500 }
      );
    }

    // Fetch updated project
    const updatedProject = await prisma.studentProject.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      syncResult: syncResult.updates,
      message: 'Project synced successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('POST /api/student/projects/[id]/sync failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync project' },
      { status: 500 }
    );
  }
}
