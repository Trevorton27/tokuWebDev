/**
 * Student Projects API
 * GET /api/student/projects - List all projects for student
 * POST /api/student/projects - Create/link a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  parseGitHubUrl,
  syncProjectWithGitHub,
} from '@/server/github/projectSyncService';

/**
 * GET /api/student/projects
 * List all projects for the authenticated student
 */
export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    const projects = await prisma.studentProject.findMany({
      where: { userId: user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { isCurrent: 'desc' }, // Current project first
        { updatedAt: 'desc' }, // Then by most recently updated
      ],
    });

    // Calculate stats for each project
    const projectsWithStats = projects.map((project) => {
      const totalMilestones = project.milestones.length;
      const completedMilestones = project.milestones.filter(
        (m) => m.completed
      ).length;
      const progress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;

      return {
        ...project,
        stats: {
          totalMilestones,
          completedMilestones,
          progress,
        },
      };
    });

    return NextResponse.json({
      success: true,
      projects: projectsWithStats,
      count: projects.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/student/projects failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/projects
 * Create/link a new GitHub project
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { repoUrl, title, description, isCurrent, milestones } = body;

    // Validation
    if (!repoUrl || !title) {
      return NextResponse.json(
        { success: false, error: 'repoUrl and title are required' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub repository URL' },
        { status: 400 }
      );
    }

    // If setting as current, unset other current projects
    if (isCurrent) {
      await prisma.studentProject.updateMany({
        where: {
          userId: user.id,
          isCurrent: true,
        },
        data: {
          isCurrent: false,
        },
      });
    }

    // Create project
    const project = await prisma.studentProject.create({
      data: {
        userId: user.id,
        repoUrl,
        repoOwner: parsed.owner,
        repoName: parsed.repo,
        repoFullName: parsed.fullName,
        title,
        description,
        isCurrent: isCurrent || false,
        status: 'IN_PROGRESS',
      },
    });

    // Create milestones if provided
    if (milestones && Array.isArray(milestones)) {
      await prisma.projectMilestone.createMany({
        data: milestones.map((m: any, index: number) => ({
          projectId: project.id,
          title: m.title,
          description: m.description,
          order: m.order ?? index,
          linkedToBranch: m.linkedToBranch,
          linkedToFile: m.linkedToFile,
          linkedToCommitMsg: m.linkedToCommitMsg,
        })),
      });
    }

    logger.info('Student project created', {
      userId: user.id,
      projectId: project.id,
      repoFullName: parsed.fullName,
    });

    // Trigger initial sync (async, non-blocking)
    syncProjectWithGitHub(project.id).catch((err) => {
      logger.error('Initial project sync failed', err, {
        projectId: project.id,
      });
    });

    // Fetch created project with milestones
    const createdProject = await prisma.studentProject.findUnique({
      where: { id: project.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: createdProject,
      message: 'Project linked successfully. Initial sync in progress...',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('POST /api/student/projects failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
