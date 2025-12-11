import { NextRequest, NextResponse } from 'next/server';
import { getEnrollments, enrollUser } from '@/server/lms/enrollmentService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const enrollments = await getEnrollments(user.id);

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    logger.error('GET /api/lms/enrollments failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const enrollment = await enrollUser(user.id, courseId);

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error: any) {
    logger.error('POST /api/lms/enrollments failed', error);

    if (error.message === 'Already enrolled in this course') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}
