import { NextRequest, NextResponse } from 'next/server';
import { createLesson, getLessonsByCourse } from '@/server/lms/lessonService';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const lessons = await getLessonsByCourse(params.courseId);

    return NextResponse.json({
      success: true,
      data: lessons,
    });
  } catch (error) {
    logger.error('GET /api/lms/courses/:courseId/lessons failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json();
    const { title, content, order, videoUrl, duration } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const lesson = await createLesson({
      courseId: params.courseId,
      title,
      content,
      order: order ?? 1,
      videoUrl,
      duration,
    });

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    logger.error('POST /api/lms/courses/:courseId/lessons failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
