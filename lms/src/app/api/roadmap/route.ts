import { NextRequest, NextResponse } from 'next/server';
import {
  getRoadmap,
  getRoadmapSummary,
  updateRoadmapItemStatus,
  getNextRoadmapItem,
} from '@/server/lms/roadmapService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { RoadmapStatus } from '@prisma/client';

/**
 * GET /api/roadmap
 * Get the current user's roadmap
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const includeSummary = searchParams.get('summary') === 'true';
    const nextOnly = searchParams.get('next') === 'true';

    // If only requesting next item
    if (nextOnly) {
      const nextItem = await getNextRoadmapItem(user.id);
      return NextResponse.json({
        success: true,
        data: { nextItem },
      });
    }

    // Get full roadmap
    const items = await getRoadmap(user.id);

    // Optionally include summary
    let summary = null;
    if (includeSummary) {
      summary = await getRoadmapSummary(user.id);
    }

    // Group items by phase for easier frontend consumption
    const byPhase: Record<number, typeof items> = {};
    for (const item of items) {
      if (!byPhase[item.phase]) {
        byPhase[item.phase] = [];
      }
      byPhase[item.phase].push(item);
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        byPhase,
        summary,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/roadmap failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get roadmap' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/roadmap
 * Update a roadmap item's status
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing itemId' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(RoadmapStatus);
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedItem = await updateRoadmapItemStatus(itemId, status as RoadmapStatus);

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('PATCH /api/roadmap failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update roadmap item' },
      { status: 500 }
    );
  }
}
