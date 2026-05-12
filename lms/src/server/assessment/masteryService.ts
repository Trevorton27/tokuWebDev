/**
 * Mastery service - Track student skill proficiency and progress
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Attempt, MasteryProfile } from '@/lib/types';
import { MasteryEventType } from '@prisma/client';

export async function recordAttempt(data: {
  userId: string;
  challengeId: string;
  code: string;
  passed: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
}): Promise<Attempt> {
  try {
    const attempt = await prisma.attempt.create({
      data,
    });

    // Get challenge tags to record mastery events
    const challenge = await prisma.challenge.findUnique({
      where: { id: data.challengeId },
      select: { tags: true },
    });

    if (challenge) {
      // Record mastery events for each skill tag
      await Promise.all(
        challenge.tags.map((tag) =>
          recordMasteryEvent(
            data.userId,
            tag,
            data.passed ? MasteryEventType.SUCCESS : MasteryEventType.FAILURE,
            {
              attemptId: attempt.id,
              score: data.score,
              timeSpent: data.timeSpent,
            }
          )
        )
      );
    }

    logger.info('Attempt recorded', {
      userId: data.userId,
      challengeId: data.challengeId,
      passed: data.passed,
      score: data.score,
    });

    return attempt;
  } catch (error) {
    logger.error('Failed to record attempt', error, { data });
    throw new Error('Failed to record attempt');
  }
}

export async function recordMasteryEvent(
  userId: string,
  skillTag: string,
  event: MasteryEventType,
  metadata?: any
): Promise<void> {
  try {
    await prisma.masteryEvent.create({
      data: {
        userId,
        skillTag,
        event,
        metadata,
      },
    });

    logger.debug('Mastery event recorded', { userId, skillTag, event });
  } catch (error) {
    logger.error('Failed to record mastery event', error, { userId, skillTag, event });
    // Don't throw - mastery tracking should not block attempt recording
  }
}

export async function getMasteryProfile(userId: string): Promise<MasteryProfile> {
  try {
    const events = await prisma.masteryEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    // Aggregate events by skill tag
    const skills: MasteryProfile['skills'] = {};

    events.forEach((event) => {
      if (!skills[event.skillTag]) {
        skills[event.skillTag] = {
          proficiency: 0,
          attempts: 0,
          successes: 0,
          lastAttempt: event.timestamp,
        };
      }

      const skill = skills[event.skillTag];

      if (event.event === MasteryEventType.ATTEMPT) {
        skill.attempts++;
      } else if (event.event === MasteryEventType.SUCCESS) {
        skill.successes++;
      }

      // Update last attempt
      if (event.timestamp > skill.lastAttempt) {
        skill.lastAttempt = event.timestamp;
      }
    });

    // Calculate proficiency scores (0-100)
    Object.keys(skills).forEach((tag) => {
      const skill = skills[tag];
      if (skill.attempts > 0) {
        // Simple success rate with recency weighting
        const successRate = skill.successes / skill.attempts;
        const recencyFactor = Math.min(1, skill.attempts / 10); // More attempts = higher confidence
        skill.proficiency = Math.round(successRate * recencyFactor * 100);
      }
    });

    return { userId, skills };
  } catch (error) {
    logger.error('Failed to get mastery profile', error, { userId });
    return { userId, skills: {} };
  }
}

export async function getWeakAreas(userId: string, threshold = 50): Promise<string[]> {
  try {
    const profile = await getMasteryProfile(userId);
    
    const weakSkills = Object.entries(profile.skills)
      .filter(([_, skill]) => skill.proficiency < threshold)
      .sort((a, b) => a[1].proficiency - b[1].proficiency)
      .map(([tag]) => tag);

    return weakSkills;
  } catch (error) {
    logger.error('Failed to get weak areas', error, { userId });
    return [];
  }
}

export async function getAttemptHistory(
  userId: string,
  challengeId?: string
): Promise<Attempt[]> {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        challengeId,
      },
      orderBy: {
        attemptedAt: 'desc',
      },
      take: 50,
    });

    return attempts;
  } catch (error) {
    logger.error('Failed to get attempt history', error, { userId, challengeId });
    throw new Error('Failed to retrieve attempt history');
  }
}
