import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/roadmaps/:studentId - Get student's roadmap
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const roadmapItems = await prisma.studentRoadmap.findMany({
      where: { userId: params.studentId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: roadmapItems,
    });
  } catch (error: any) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roadmap' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/roadmaps/:studentId - Delete roadmap item by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId query parameter is required' },
        { status: 400 }
      );
    }

    await prisma.studentRoadmap.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Roadmap item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting roadmap item:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Roadmap item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete roadmap item' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/roadmaps/:studentId - Update roadmap item
export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { itemId, title, description, status, order, targetDate, completedAt, metadata } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (order !== undefined) updateData.order = order;
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Auto-set completedAt when status changes to COMPLETED
    if (status === 'COMPLETED' && !completedAt) {
      updateData.completedAt = new Date();
    }

    const roadmapItem = await prisma.studentRoadmap.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: roadmapItem,
      message: 'Roadmap item updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating roadmap item:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Roadmap item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update roadmap item' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
