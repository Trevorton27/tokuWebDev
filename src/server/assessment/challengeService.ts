/**
 * Challenge service - Business logic for coding challenges
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Challenge, ChallengeFilters } from '@/lib/types';
import { Difficulty, Language } from '@prisma/client';

export async function listChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
  try {
    const where: any = {};

    if (filters?.difficulty && filters.difficulty.length > 0) {
      where.difficulty = { in: filters.difficulty };
    }

    if (filters?.language && filters.language.length > 0) {
      where.language = { in: filters.language };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return challenges;
  } catch (error) {
    logger.error('Failed to list challenges', error, { filters });
    throw new Error('Failed to retrieve challenges');
  }
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isHidden: false },
        },
      },
    });

    return challenge as any; // TODO: Type properly with relations
  } catch (error) {
    logger.error('Failed to get challenge', error, { slug });
    throw new Error('Failed to retrieve challenge');
  }
}

export async function getChallengeById(challengeId: string): Promise<Challenge | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: true,
      },
    });

    return challenge as any;
  } catch (error) {
    logger.error('Failed to get challenge by id', error, { challengeId });
    throw new Error('Failed to retrieve challenge');
  }
}

export async function searchChallenges(query: string): Promise<Challenge[]> {
  return listChallenges({ search: query });
}

export async function getRelatedChallenges(challengeId: string, limit = 5): Promise<Challenge[]> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { tags: true, difficulty: true },
    });

    if (!challenge) {
      return [];
    }

    // Find challenges with similar tags
    const related = await prisma.challenge.findMany({
      where: {
        id: { not: challengeId },
        tags: { hasSome: challenge.tags },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return related;
  } catch (error) {
    logger.error('Failed to get related challenges', error, { challengeId });
    return [];
  }
}

export async function createChallenge(data: {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  starterCode: string;
  solution: string;
  tags: string[];
  hints: string[];
}): Promise<Challenge> {
  try {
    const challenge = await prisma.challenge.create({
      data,
    });

    logger.info('Challenge created', { challengeId: challenge.id, slug: challenge.slug });
    return challenge;
  } catch (error) {
    logger.error('Failed to create challenge', error, { data });
    throw new Error('Failed to create challenge');
  }
}
