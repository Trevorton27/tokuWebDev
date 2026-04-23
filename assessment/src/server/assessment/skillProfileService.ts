/**
 * Skill Profile Service
 *
 * Manages per-user skill mastery profiles with confidence tracking.
 * Provides functions to read, update, and aggregate skill data.
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
  SKILL_TAGS,
  DIMENSIONS,
  getSkillsByDimension,
  getSkillByKey,
  getAllDimensionKeys,
  mapTagsToSkillKeys,
  type SkillDimension,
  type SkillProfile,
  type SkillMasteryData,
} from './skillModel';

// ============================================
// TYPES
// ============================================

export interface MasteryUpdate {
  skillKey: string;
  score: number; // 0-1, the score from this assessment
  weight?: number; // 0-1, how much to weight this update (default 1.0)
  source?: string; // where this update came from (e.g., 'intake_mcq', 'challenge', 'self_report')
}

export interface UpdateResult {
  skillKey: string;
  previousMastery: number;
  newMastery: number;
  previousConfidence: number;
  newConfidence: number;
  delta: number;
}

// ============================================
// MASTERY UPDATE ALGORITHM
// ============================================

/**
 * Calculate new mastery and confidence values given a new score.
 *
 * Uses a simple Bayesian-inspired update:
 * - New mastery moves toward the score, weighted by confidence and learning rate
 * - Confidence increases with each assessment (diminishing returns)
 *
 * @param current Current mastery data
 * @param score New score (0-1)
 * @param weight Weight of this assessment (0-1, default 1.0)
 * @returns Updated mastery and confidence
 */
export function calculateMasteryUpdate(
  current: SkillMasteryData,
  score: number,
  weight: number = 1.0
): { mastery: number; confidence: number } {
  // Base learning rate - how quickly mastery adjusts
  const baseLearningRate = 0.3;

  // Learning rate is scaled by inverse of confidence
  // Low confidence = faster updates, high confidence = slower updates
  const confidenceFactor = 1 - current.confidence * 0.7; // 0.3 to 1.0
  const effectiveLearningRate = baseLearningRate * confidenceFactor * weight;

  // Update mastery toward the new score
  const masteryDelta = (score - current.mastery) * effectiveLearningRate;
  const newMastery = Math.max(0, Math.min(1, current.mastery + masteryDelta));

  // Confidence increases with each assessment (diminishing returns)
  // Formula: confidence approaches 1 asymptotically
  const confidenceGain = (1 - current.confidence) * 0.15 * weight;
  const newConfidence = Math.min(1, current.confidence + confidenceGain);

  return {
    mastery: newMastery,
    confidence: newConfidence,
  };
}

/**
 * Calculate initial mastery from self-reported confidence level (1-5 scale)
 * Used during intake questionnaire
 */
export function selfReportToMastery(selfConfidence: number): SkillMasteryData {
  // Map 1-5 to 0-1 mastery with low confidence
  const mastery = Math.max(0, Math.min(1, (selfConfidence - 1) / 4));

  return {
    mastery,
    confidence: 0.2, // Self-reports have low confidence
    attempts: 1,
  };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Get a user's complete skill profile with dimension aggregates
 */
export async function getSkillProfile(userId: string): Promise<SkillProfile> {
  try {
    const masteryRecords = await prisma.userSkillMastery.findMany({
      where: { userId },
    });

    // Build skills map
    const skills: Record<string, SkillMasteryData> = {};
    for (const record of masteryRecords) {
      skills[record.skillKey] = {
        mastery: record.mastery,
        confidence: record.confidence,
        attempts: record.attempts,
      };
    }

    // Calculate dimension aggregates
    const dimensions = calculateDimensionScores(skills);

    return {
      userId,
      skills,
      dimensions,
      lastUpdated: masteryRecords.length > 0
        ? masteryRecords.reduce((latest, r) =>
            r.updatedAt > latest ? r.updatedAt : latest, masteryRecords[0].updatedAt)
        : new Date(),
    };
  } catch (error) {
    logger.error('Failed to get skill profile', error, { userId });
    return {
      userId,
      skills: {},
      dimensions: createEmptyDimensionScores(),
      lastUpdated: new Date(),
    };
  }
}

/**
 * Get mastery data for a specific skill
 */
export async function getSkillMastery(
  userId: string,
  skillKey: string
): Promise<SkillMasteryData | null> {
  try {
    const record = await prisma.userSkillMastery.findUnique({
      where: {
        userId_skillKey: { userId, skillKey },
      },
    });

    if (!record) return null;

    return {
      mastery: record.mastery,
      confidence: record.confidence,
      attempts: record.attempts,
    };
  } catch (error) {
    logger.error('Failed to get skill mastery', error, { userId, skillKey });
    return null;
  }
}

/**
 * Update mastery for a single skill
 */
export async function updateSkillMastery(
  userId: string,
  update: MasteryUpdate
): Promise<UpdateResult> {
  const { skillKey, score, weight = 1.0, source } = update;

  try {
    // Get current mastery or default
    const current = await getSkillMastery(userId, skillKey);
    const currentData: SkillMasteryData = current || {
      mastery: 0.5, // Default to middle for unknown skills
      confidence: 0,
      attempts: 0,
    };

    // Calculate new values
    const { mastery: newMastery, confidence: newConfidence } =
      calculateMasteryUpdate(currentData, score, weight);

    // Upsert the record
    await prisma.userSkillMastery.upsert({
      where: {
        userId_skillKey: { userId, skillKey },
      },
      create: {
        userId,
        skillKey,
        mastery: newMastery,
        confidence: newConfidence,
        attempts: 1,
      },
      update: {
        mastery: newMastery,
        confidence: newConfidence,
        attempts: { increment: 1 },
      },
    });

    logger.debug('Skill mastery updated', {
      userId,
      skillKey,
      score,
      source,
      previousMastery: currentData.mastery,
      newMastery,
    });

    return {
      skillKey,
      previousMastery: currentData.mastery,
      newMastery,
      previousConfidence: currentData.confidence,
      newConfidence,
      delta: newMastery - currentData.mastery,
    };
  } catch (error) {
    logger.error('Failed to update skill mastery', error, { userId, skillKey, score });
    throw new Error(`Failed to update mastery for skill ${skillKey}`);
  }
}

/**
 * Update mastery for multiple skills at once
 */
export async function updateMultipleSkillMasteries(
  userId: string,
  updates: MasteryUpdate[]
): Promise<UpdateResult[]> {
  const results: UpdateResult[] = [];

  for (const update of updates) {
    try {
      const result = await updateSkillMastery(userId, update);
      results.push(result);
    } catch (error) {
      logger.error('Failed to update skill in batch', error, {
        userId,
        skillKey: update.skillKey,
      });
      // Continue with other updates
    }
  }

  return results;
}

/**
 * Set initial mastery values from self-reported confidence levels
 * Used during intake questionnaire
 */
export async function setInitialMasteriesFromSelfReport(
  userId: string,
  reports: Array<{ skillKey: string; selfConfidence: number }>
): Promise<void> {
  try {
    for (const { skillKey, selfConfidence } of reports) {
      const { mastery, confidence } = selfReportToMastery(selfConfidence);

      await prisma.userSkillMastery.upsert({
        where: {
          userId_skillKey: { userId, skillKey },
        },
        create: {
          userId,
          skillKey,
          mastery,
          confidence,
          attempts: 1,
        },
        update: {
          // Only update if confidence is lower (don't overwrite assessed data with self-report)
          mastery: {
            set: mastery,
          },
          confidence: {
            set: confidence,
          },
        },
      });
    }

    logger.info('Initial masteries set from self-report', {
      userId,
      skillCount: reports.length,
    });
  } catch (error) {
    logger.error('Failed to set initial masteries', error, { userId });
    throw new Error('Failed to set initial skill masteries');
  }
}

/**
 * Update mastery based on challenge attempt results
 * Bridges the existing challenge/mastery system with the new skill model
 */
export async function updateMasteryFromChallenge(
  userId: string,
  challengeTags: string[],
  passed: boolean,
  score: number // 0-100
): Promise<UpdateResult[]> {
  // Map challenge tags to skill keys
  const skillKeys = mapTagsToSkillKeys(challengeTags);

  if (skillKeys.length === 0) {
    logger.debug('No skill keys mapped from challenge tags', { challengeTags });
    return [];
  }

  // Normalize score to 0-1
  const normalizedScore = score / 100;

  // Create updates for each skill
  const updates: MasteryUpdate[] = skillKeys.map((skillKey) => ({
    skillKey,
    score: normalizedScore,
    weight: passed ? 1.0 : 0.8, // Weight failures slightly less
    source: 'challenge',
  }));

  return updateMultipleSkillMasteries(userId, updates);
}

// ============================================
// DIMENSION AGGREGATION
// ============================================

/**
 * Calculate aggregate scores for each dimension based on skill masteries
 */
export function calculateDimensionScores(
  skills: Record<string, SkillMasteryData>
): SkillProfile['dimensions'] {
  const dimensions = createEmptyDimensionScores();

  for (const dimensionKey of getAllDimensionKeys()) {
    const dimensionSkills = getSkillsByDimension(dimensionKey);
    let totalWeightedMastery = 0;
    let totalWeightedConfidence = 0;
    let totalWeight = 0;
    let assessedCount = 0;

    for (const skillConfig of dimensionSkills) {
      const skillData = skills[skillConfig.key];
      const weight = skillConfig.weight;

      if (skillData && skillData.attempts > 0) {
        totalWeightedMastery += skillData.mastery * weight;
        totalWeightedConfidence += skillData.confidence * weight;
        totalWeight += weight;
        assessedCount++;
      }
    }

    dimensions[dimensionKey] = {
      score: totalWeight > 0 ? totalWeightedMastery / totalWeight : 0,
      confidence: totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0,
      skillCount: dimensionSkills.length,
      assessedCount,
    };
  }

  return dimensions;
}

/**
 * Create empty dimension scores structure
 */
function createEmptyDimensionScores(): SkillProfile['dimensions'] {
  const dimensions: SkillProfile['dimensions'] = {} as SkillProfile['dimensions'];

  for (const dimensionKey of getAllDimensionKeys()) {
    const skillCount = getSkillsByDimension(dimensionKey).length;
    dimensions[dimensionKey] = {
      score: 0,
      confidence: 0,
      skillCount,
      assessedCount: 0,
    };
  }

  return dimensions;
}

/**
 * Get weak dimensions (below threshold) sorted by score
 */
export async function getWeakDimensions(
  userId: string,
  threshold: number = 0.5
): Promise<Array<{ dimension: SkillDimension; score: number; confidence: number }>> {
  const profile = await getSkillProfile(userId);

  return getAllDimensionKeys()
    .filter((dim) => profile.dimensions[dim].score < threshold)
    .map((dim) => ({
      dimension: dim,
      score: profile.dimensions[dim].score,
      confidence: profile.dimensions[dim].confidence,
    }))
    .sort((a, b) => a.score - b.score);
}

/**
 * Get weak skills within a dimension
 */
export async function getWeakSkillsInDimension(
  userId: string,
  dimension: SkillDimension,
  threshold: number = 0.5
): Promise<Array<{ skillKey: string; mastery: number; confidence: number }>> {
  const profile = await getSkillProfile(userId);
  const dimensionSkills = getSkillsByDimension(dimension);

  return dimensionSkills
    .filter((skill) => {
      const data = profile.skills[skill.key];
      return !data || data.mastery < threshold;
    })
    .map((skill) => {
      const data = profile.skills[skill.key];
      return {
        skillKey: skill.key,
        mastery: data?.mastery ?? 0,
        confidence: data?.confidence ?? 0,
      };
    })
    .sort((a, b) => a.mastery - b.mastery);
}

/**
 * Get skills that need assessment (low confidence)
 */
export async function getSkillsNeedingAssessment(
  userId: string,
  confidenceThreshold: number = 0.3
): Promise<string[]> {
  const profile = await getSkillProfile(userId);

  // Find skills with low confidence that haven't been assessed much
  const lowConfidenceSkills = SKILL_TAGS
    .filter((skill) => {
      const data = profile.skills[skill.key];
      return !data || data.confidence < confidenceThreshold;
    })
    .map((skill) => skill.key);

  return lowConfidenceSkills;
}

/**
 * Get a summary suitable for display (e.g., radar chart data)
 */
export async function getProfileSummary(userId: string): Promise<{
  dimensions: Array<{
    key: SkillDimension;
    label: string;
    score: number;
    confidence: number;
    assessedRatio: number;
  }>;
  overallScore: number;
  overallConfidence: number;
  totalSkillsAssessed: number;
  totalSkills: number;
}> {
  const profile = await getSkillProfile(userId);

  const dimensionSummaries = DIMENSIONS.map((dim) => {
    const data = profile.dimensions[dim.key];
    return {
      key: dim.key,
      label: dim.label,
      score: data.score,
      confidence: data.confidence,
      assessedRatio: data.skillCount > 0 ? data.assessedCount / data.skillCount : 0,
    };
  }).sort((a, b) => a.key.localeCompare(b.key)); // Sort alphabetically by key for consistency

  // Calculate overall scores
  let totalWeightedScore = 0;
  let totalWeightedConfidence = 0;
  let totalAssessed = 0;
  let totalWeight = 0;

  for (const dim of dimensionSummaries) {
    if (dim.assessedRatio > 0) {
      totalWeightedScore += dim.score;
      totalWeightedConfidence += dim.confidence;
      totalWeight += 1;
      totalAssessed += Math.round(dim.assessedRatio * SKILL_TAGS.filter(s => s.dimension === dim.key).length);
    }
  }

  return {
    dimensions: dimensionSummaries,
    overallScore: totalWeight > 0 ? totalWeightedScore / totalWeight : 0,
    overallConfidence: totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0,
    totalSkillsAssessed: totalAssessed,
    totalSkills: SKILL_TAGS.length,
  };
}
