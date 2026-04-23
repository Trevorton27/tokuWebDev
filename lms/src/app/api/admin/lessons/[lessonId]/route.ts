import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/lessons/:lessonId - Get lesson details
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lesson' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/lessons/:lessonId - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { title, content, order, videoUrl, duration } = body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (order !== undefined) updateData.order = order;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (duration !== undefined) updateData.duration = duration;

    const lesson = await prisma.lesson.update({
      where: { id: params.lessonId },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: lesson,
      message: 'Lesson updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating lesson:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lesson' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/lessons/:lessonId - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    await prisma.lesson.delete({
      where: { id: params.lessonId },
    });

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete lesson' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
