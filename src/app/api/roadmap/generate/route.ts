import { NextRequest, NextResponse } from 'next/server';
import { generateRoadmap, regenerateRoadmap } from '@/server/lms/roadmapService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/roadmap/generate
 * Generate a personalized learning roadmap
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json().catch(() => ({}));
    const {
      targetRole = 'junior_fullstack',
      maxWeeks = 16,
      hoursPerWeek = 10,
      regenerate = false,
    } = body;

    // Validate inputs
    const validRoles = ['junior_fullstack', 'frontend', 'backend'];
    if (!validRoles.includes(targetRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid targetRole. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    if (maxWeeks < 1 || maxWeeks > 52) {
      return NextResponse.json(
        { success: false, error: 'maxWeeks must be between 1 and 52' },
        { status: 400 }
      );
    }

    if (hoursPerWeek < 1 || hoursPerWeek > 40) {
      return NextResponse.json(
        { success: false, error: 'hoursPerWeek must be between 1 and 40' },
        { status: 400 }
      );
    }

    const options = {
      targetRole: targetRole as 'junior_fullstack' | 'frontend' | 'backend',
      maxWeeks,
      hoursPerWeek,
      focusOnWeakAreas: true,
    };

    // Generate or regenerate roadmap
    const roadmapItems = regenerate
      ? await regenerateRoadmap(user.id, options)
      : await generateRoadmap(user.id, options);

    // Calculate summary stats
    const totalHours = roadmapItems.reduce((sum, item) => sum + item.estimatedHours, 0);
    const phaseCount = new Set(roadmapItems.map((i) => i.phase)).size;

    return NextResponse.json({
      success: true,
      data: {
        items: roadmapItems,
        summary: {
          totalItems: roadmapItems.length,
          totalHours,
          phases: phaseCount,
          estimatedWeeks: Math.ceil(totalHours / hoursPerWeek),
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

    logger.error('POST /api/roadmap/generate failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
