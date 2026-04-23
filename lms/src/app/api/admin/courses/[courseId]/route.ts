import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/courses/:courseId - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

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
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch course' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/courses/:courseId - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { title, description, thumbnailUrl, published, instructorId } = body;

    const updateData: any = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (published !== undefined) updateData.published = published;

    // If instructorId is provided, it might be a Clerk ID, so we need to look up the database user ID
    if (instructorId) {
      // Check if this is a Clerk ID (starts with 'user_') or a database ID (cuid)
      const isClerkId = instructorId.startsWith('user_');

      if (isClerkId) {
        // Look up the database user ID from the Clerk ID
        const dbUser = await prisma.user.findFirst({
          where: { clerkId: instructorId },
          select: { id: true },
        });

        if (!dbUser) {
          return NextResponse.json(
            { success: false, error: 'Instructor not found in database' },
            { status: 404 }
          );
        }

        updateData.instructorId = dbUser.id;
      } else {
        // It's already a database ID
        updateData.instructorId = instructorId;
      }
    }

    const course = await prisma.course.update({
      where: { id: params.courseId },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating course:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update course' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/courses/:courseId - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    await prisma.course.delete({
      where: { id: params.courseId },
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete course' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
