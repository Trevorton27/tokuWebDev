import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, updateCourse } from '@/server/lms/courseService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Get user if authenticated (optional for public course viewing)
    let userId: string | undefined;
    try {
      const user = await requireAuth();
      userId = user.id;
    } catch {
      // User not authenticated - that's okay for viewing course details
      userId = undefined;
    }

    const course = await getCourseById(params.courseId, userId);

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('GET /api/lms/courses/[courseId] failed', error, { courseId: params.courseId });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json();
    const { title, description, thumbnailUrl, published } = body;

    const course = await updateCourse(params.courseId, {
      title,
      description,
      thumbnailUrl,
      published,
    });

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('PUT /api/lms/courses/[courseId] failed', error, { courseId: params.courseId });
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}
