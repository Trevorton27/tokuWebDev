import { NextRequest, NextResponse } from 'next/server';
import { getAvailableCourses } from '@/server/lms/enrollmentService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const courses = await getAvailableCourses(user.id);

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    logger.error('GET /api/lms/courses/available failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch available courses' },
      { status: 500 }
    );
  }
}
