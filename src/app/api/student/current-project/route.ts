/**
 * GET /api/student/current-project
 * Get the current active project for the student
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    // Get current project (isCurrent = true)
    const currentProject = await prisma.studentProject.findFirst({
      where: {
        userId: user.id,
        isCurrent: true,
      },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!currentProject) {
      return NextResponse.json({
        success: true,
        project: null,
        message: 'No current project set',
      });
    }

    // Calculate completion stats
    const totalMilestones = currentProject.milestones.length;
    const completedMilestones = currentProject.milestones.filter((m) => m.completed).length;
    const progress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      project: {
        ...currentProject,
        stats: {
          totalMilestones,
          completedMilestones,
          progress,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/student/current-project failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current project' },
      { status: 500 }
    );
  }
}
