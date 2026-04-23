/**
 * GET /api/student/projects/[id]/activity
 * Fetch activity timeline for a specific project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id: projectId } = params;

    // Get limit from query params (default 20, max 100)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

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
        { success: false, error: 'Unauthorized to view this project' },
        { status: 403 }
      );
    }

    // Fetch activity timeline
    const activities = await prisma.projectActivity.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/student/projects/[id]/activity failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity timeline' },
      { status: 500 }
    );
  }
}
