/**
 * Course service - Business logic for course management
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Course } from '@/lib/types';

export async function listCourses(filters?: {
  published?: boolean;
  instructorId?: string;
}): Promise<Course[]> {
  try {
    const where: any = {};

    if (filters?.published !== undefined) {
      where.published = filters.published;
    }

    if (filters?.instructorId) {
      where.instructorId = filters.instructorId;
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert null to undefined for TypeScript compatibility
    return courses.map(course => ({
      ...course,
      thumbnailUrl: course.thumbnailUrl ?? undefined,
    }));
  } catch (error) {
    logger.error('Failed to list courses', error, { filters });
    throw new Error('Failed to retrieve courses');
  }
}

export async function getCourseById(courseId: string, userId?: string): Promise<Course | null> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        ...(userId && {
          enrollments: {
            where: {
              userId,
              status: 'ACTIVE',
            },
            select: {
              id: true,
              status: true,
              enrolledAt: true,
            },
          },
        }),
      },
    });

    if (!course) return null;

    // Add computed fields
    const result = {
      ...course,
      isEnrolled: userId ? (course as any).enrollments?.length > 0 : false,
      isFull: course.maxStudents ? course._count.enrollments >= course.maxStudents : false,
      availableSlots: course.maxStudents ? course.maxStudents - course._count.enrollments : null,
    };

    return result as any; // TODO: Type properly with relations
  } catch (error) {
    logger.error('Failed to get course', error, { courseId });
    throw new Error('Failed to retrieve course');
  }
}

export async function createCourse(data: {
  title: string;
  description: string;
  instructorId: string;
  thumbnailUrl?: string;
}): Promise<Course> {
  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        instructorId: data.instructorId,
        thumbnailUrl: data.thumbnailUrl,
        published: false,
      },
    });

    logger.info('Course created', { courseId: course.id, title: course.title });

    // Convert null to undefined for TypeScript compatibility
    return {
      ...course,
      thumbnailUrl: course.thumbnailUrl ?? undefined,
    };
  } catch (error) {
    logger.error('Failed to create course', error, { data });
    throw new Error('Failed to create course');
  }
}

export async function updateCourse(
  courseId: string,
  data: Partial<{
    title: string;
    description: string;
    thumbnailUrl: string;
    published: boolean;
  }>
): Promise<Course> {
  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data,
    });

    logger.info('Course updated', { courseId });

    // Convert null to undefined for TypeScript compatibility
    return {
      ...course,
      thumbnailUrl: course.thumbnailUrl ?? undefined,
    };
  } catch (error) {
    logger.error('Failed to update course', error, { courseId, data });
    throw new Error('Failed to update course');
  }
}

export async function publishCourse(courseId: string): Promise<Course> {
  return updateCourse(courseId, { published: true });
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    logger.info('Course deleted', { courseId });
  } catch (error) {
    logger.error('Failed to delete course', error, { courseId });
    throw new Error('Failed to delete course');
  }
}
