import { NextRequest, NextResponse } from 'next/server';
import { updateLesson, deleteLesson, getLessonById } from '@/server/lms/lessonService';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const lesson = await getLessonById(params.lessonId);

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
  } catch (error) {
    logger.error('GET /api/lms/lessons/:lessonId failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const body = await request.json();
    const { title, content, order, videoUrl, duration } = body;

    const lesson = await updateLesson(params.lessonId, {
      title,
      content,
      order,
      videoUrl,
      duration,
    });

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('PUT /api/lms/lessons/:lessonId failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    await deleteLesson(params.lessonId);

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    logger.error('DELETE /api/lms/lessons/:lessonId failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
