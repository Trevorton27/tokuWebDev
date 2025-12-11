import { NextRequest, NextResponse } from 'next/server';
import { listCourses, createCourse } from '@/server/lms/courseService';
import { requireAuth, requireRole } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    const courses = await listCourses({
      published: published === 'true' ? true : undefined,
    });

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    logger.error('GET /api/lms/courses failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['INSTRUCTOR', 'ADMIN']);
    const body = await request.json();

    const { title, description, thumbnailUrl } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const course = await createCourse({
      title,
      description,
      thumbnailUrl,
      instructorId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    logger.error('POST /api/lms/courses failed', error);
    console.error('Full error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create course',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
