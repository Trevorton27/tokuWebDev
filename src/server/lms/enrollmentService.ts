/**
 * Enrollment service - Business logic for course enrollments
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Enrollment } from '@/lib/types';

export async function enrollUser(userId: string, courseId: string): Promise<Enrollment> {
  try {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (!course.published) {
      throw new Error('Course is not published');
    }

    // Check enrollment capacity
    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
      throw new Error('Course is full');
    }

    // Check if already enrolled (including DROPPED status)
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing && existing.status === 'ACTIVE') {
      throw new Error('Already enrolled in this course');
    }

    // If previously dropped, reactivate enrollment
    if (existing && existing.status === 'DROPPED') {
      const reactivated = await prisma.enrollment.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      });
      logger.info('User re-enrolled', { userId, courseId, enrollmentId: reactivated.id });
      return reactivated;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        progress: 0,
      },
    });

    logger.info('User enrolled', { userId, courseId, enrollmentId: enrollment.id });
    return enrollment;
  } catch (error) {
    logger.error('Failed to enroll user', error, { userId, courseId });
    throw error;
  }
}

export async function getEnrollments(userId: string, status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED'): Promise<Enrollment[]> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments as any; // TODO: Type properly with relations
  } catch (error) {
    logger.error('Failed to get enrollments', error, { userId });
    throw new Error('Failed to retrieve enrollments');
  }
}

export async function getEnrollmentById(enrollmentId: string): Promise<Enrollment | null> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    return enrollment;
  } catch (error) {
    logger.error('Failed to get enrollment', error, { enrollmentId });
    throw new Error('Failed to retrieve enrollment');
  }
}

export async function updateProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: Math.min(100, Math.max(0, progress)), // Clamp between 0-100
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    logger.info('Enrollment progress updated', { enrollmentId, progress });
    return enrollment;
  } catch (error) {
    logger.error('Failed to update progress', error, { enrollmentId, progress });
    throw new Error('Failed to update progress');
  }
}

export async function markCourseComplete(enrollmentId: string): Promise<Enrollment> {
  return updateProgress(enrollmentId, 100);
}

export async function unenroll(userId: string, courseId: string): Promise<void> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.status !== 'ACTIVE') {
      throw new Error('Cannot unenroll from inactive enrollment');
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'DROPPED',
      },
    });

    logger.info('User unenrolled', { userId, courseId, enrollmentId: enrollment.id });
  } catch (error) {
    logger.error('Failed to unenroll', error, { userId, courseId });
    throw error;
  }
}

export async function getAvailableCourses(userId: string) {
  try {
    // Get all published courses with enrollment info
    const courses = await prisma.course.findMany({
      where: {
        published: true,
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: {
              where: { status: 'ACTIVE' },
            },
          },
        },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map((course) => ({
      ...course,
      isEnrolled: course.enrollments.length > 0,
      isFull: course.maxStudents ? course._count.enrollments >= course.maxStudents : false,
      availableSlots: course.maxStudents ? course.maxStudents - course._count.enrollments : null,
    }));
  } catch (error) {
    logger.error('Failed to get available courses', error, { userId });
    throw new Error('Failed to retrieve available courses');
  }
}
