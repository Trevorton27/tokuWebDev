/**
 * Adaptive service - Personalized challenge recommendations
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Challenge } from '@/lib/types';
import { getMasteryProfile, getWeakAreas } from './masteryService';
import { Difficulty } from '@prisma/client';

/**
 * Get recommended challenges for a user based on mastery profile
 */
export async function getRecommendedChallenges(
  userId: string,
  limit = 10
): Promise<Challenge[]> {
  try {
    const profile = await getMasteryProfile(userId);
    const weakSkills = await getWeakAreas(userId);

    // Determine appropriate difficulty level
    const difficulty = await determineDifficulty(userId);

    // Get challenges targeting weak skills
    let challenges: Challenge[] = [];

    if (weakSkills.length > 0) {
      challenges = await prisma.challenge.findMany({
        where: {
          tags: { hasSome: weakSkills },
          difficulty,
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // If not enough challenges, fill with general recommendations
    if (challenges.length < limit) {
      const additional = await prisma.challenge.findMany({
        where: {
          difficulty,
          id: { notIn: challenges.map((c) => c.id) },
        },
        take: limit - challenges.length,
        orderBy: {
          createdAt: 'desc',
        },
      });

      challenges = [...challenges, ...additional];
    }

    logger.info('Generated recommendations', {
      userId,
      count: challenges.length,
      weakSkills,
      difficulty,
    });

    return challenges;
  } catch (error) {
    logger.error('Failed to get recommendations', error, { userId });
    // Fallback to random challenges
    return prisma.challenge.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

/**
 * Determine appropriate difficulty level based on user performance
 */
async function determineDifficulty(userId: string): Promise<Difficulty> {
  try {
    const profile = await getMasteryProfile(userId);

    const skillValues = Object.values(profile.skills);

    if (skillValues.length === 0) {
      return Difficulty.BEGINNER;
    }

    // Calculate average proficiency
    const avgProficiency =
      skillValues.reduce((sum, skill) => sum + skill.proficiency, 0) / skillValues.length;

    if (avgProficiency < 40) {
      return Difficulty.BEGINNER;
    } else if (avgProficiency < 70) {
      return Difficulty.INTERMEDIATE;
    } else {
      return Difficulty.ADVANCED;
    }
  } catch (error) {
    logger.error('Failed to determine difficulty', error, { userId });
    return Difficulty.BEGINNER;
  }
}

/**
 * Select the next optimal challenge for the user
 */
export async function selectNextChallenge(userId: string): Promise<Challenge | null> {
  try {
    const recommendations = await getRecommendedChallenges(userId, 1);
    return recommendations[0] || null;
  } catch (error) {
    logger.error('Failed to select next challenge', error, { userId });
    return null;
  }
}

/**
 * Generate a micro-drill for targeted skill practice
 * TODO: Implement AI-based micro-drill generation
 */
export async function generateMicroDrill(
  userId: string,
  skillTag: string
): Promise<Challenge | null> {
  try {
    // For now, just find an existing challenge for the skill
    const challenge = await prisma.challenge.findFirst({
      where: {
        tags: { has: skillTag },
        difficulty: Difficulty.BEGINNER,
      },
    });

    logger.info('Generated micro-drill', { userId, skillTag, challengeId: challenge?.id });
    return challenge;
  } catch (error) {
    logger.error('Failed to generate micro-drill', error, { userId, skillTag });
    return null;
  }
}

/**
 * Adjust difficulty based on recent performance
 */
export async function adjustDifficulty(userId: string): Promise<Difficulty> {
  return determineDifficulty(userId);
}
