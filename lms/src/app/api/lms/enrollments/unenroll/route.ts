import { NextRequest, NextResponse } from 'next/server';
import { unenroll } from '@/server/lms/enrollmentService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

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

    await unenroll(user.id, courseId);

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error: any) {
    logger.error('POST /api/lms/enrollments/unenroll failed', error);

    if (error.message === 'Enrollment not found' || error.message === 'Cannot unenroll from inactive enrollment') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to unenroll from course' },
      { status: 500 }
    );
  }
}
