import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/lessons - List all lessons
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.lesson.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        lessons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lessons' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/lessons - Create lesson
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { courseId, title, content, order, videoUrl, duration } = body;

    if (!courseId || !title || !content || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'courseId, title, content, and order are required' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        content,
        order,
        videoUrl,
        duration,
      },
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
      message: 'Lesson created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create lesson' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
