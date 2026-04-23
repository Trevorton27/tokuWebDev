/**
 * Lesson service - Business logic for lesson management
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Lesson } from '@/lib/types';

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) return null;

    // Convert null to undefined for TypeScript compatibility
    return {
      ...lesson,
      videoUrl: lesson.videoUrl ?? undefined,
      duration: lesson.duration ?? undefined,
    };
  } catch (error) {
    logger.error('Failed to get lesson', error, { lessonId });
    throw new Error('Failed to retrieve lesson');
  }
}

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    // Convert null to undefined for TypeScript compatibility
    return lessons.map(lesson => ({
      ...lesson,
      videoUrl: lesson.videoUrl ?? undefined,
      duration: lesson.duration ?? undefined,
    }));
  } catch (error) {
    logger.error('Failed to get lessons', error, { courseId });
    throw new Error('Failed to retrieve lessons');
  }
}

export async function createLesson(data: {
  courseId: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  duration?: number;
}): Promise<Lesson> {
  try {
    const lesson = await prisma.lesson.create({
      data,
    });

    logger.info('Lesson created', { lessonId: lesson.id, courseId: data.courseId });

    // Convert null to undefined for TypeScript compatibility
    return {
      ...lesson,
      videoUrl: lesson.videoUrl ?? undefined,
      duration: lesson.duration ?? undefined,
    };
  } catch (error) {
    logger.error('Failed to create lesson', error, { data });
    throw new Error('Failed to create lesson');
  }
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    content: string;
    order: number;
    videoUrl: string;
    duration: number;
  }>
): Promise<Lesson> {
  try {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    logger.info('Lesson updated', { lessonId });

    // Convert null to undefined for TypeScript compatibility
    return {
      ...lesson,
      videoUrl: lesson.videoUrl ?? undefined,
      duration: lesson.duration ?? undefined,
    };
  } catch (error) {
    logger.error('Failed to update lesson', error, { lessonId, data });
    throw new Error('Failed to update lesson');
  }
}

export async function reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
  try {
    // Update order for each lesson
    await Promise.all(
      lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        })
      )
    );

    logger.info('Lessons reordered', { courseId, count: lessonIds.length });
  } catch (error) {
    logger.error('Failed to reorder lessons', error, { courseId, lessonIds });
    throw new Error('Failed to reorder lessons');
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  try {
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    logger.info('Lesson deleted', { lessonId });
  } catch (error) {
    logger.error('Failed to delete lesson', error, { lessonId });
    throw new Error('Failed to delete lesson');
  }
}
