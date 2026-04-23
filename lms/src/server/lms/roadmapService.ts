/**
 * Roadmap Service
 *
 * Generates and manages personalized learning roadmaps based on student skill profiles.
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { RoadmapItemType, RoadmapStatus } from '@prisma/client';
import {
  getSkillProfile,
  getWeakDimensions,
} from '@/server/assessment/skillProfileService';
import {
  SKILL_TAGS,
  getAllDimensionKeys,
  getSkillsByDimension,
  type SkillDimension,
} from '@/server/assessment/skillModel';
import {
  LEARNING_RESOURCES,
  PHASES,
  getResourcesByPhase,
  getResourceById,
  getResourcesForSkills,
  calculateTotalHours,
  type LearningResource,
  type ResourceType,
} from './curriculumConfig';

// ============================================
// TYPES
// ============================================

export interface GenerateRoadmapOptions {
  targetRole?: 'junior_fullstack' | 'frontend' | 'backend';
  maxWeeks?: number;
  hoursPerWeek?: number;
  focusOnWeakAreas?: boolean;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  itemType: RoadmapItemType;
  status: RoadmapStatus;
  phase: number;
  order: number;
  skillKeys: string[];
  difficulty: number;
  estimatedHours: number;
  metadata: Record<string, any> | null;
}

export interface RoadmapSummary {
  userId: string;
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  totalHours: number;
  completedHours: number;
  phases: Array<{
    phase: number;
    title: string;
    itemCount: number;
    completedCount: number;
  }>;
}

// ============================================
// ROADMAP GENERATION
// ============================================

/**
 * Generate a personalized learning roadmap for a user
 */
export async function generateRoadmap(
  userId: string,
  options: GenerateRoadmapOptions = {}
): Promise<RoadmapItem[]> {
  const {
    targetRole = 'junior_fullstack',
    maxWeeks = 16,
    hoursPerWeek = 10,
    focusOnWeakAreas = true,
  } = options;

  try {
    // Get user's skill profile
    const skillProfile = await getSkillProfile(userId);
    const weakDimensions = await getWeakDimensions(userId, 0.5);

    // Calculate time budget
    const totalBudgetHours = maxWeeks * hoursPerWeek;

    // Select resources based on profile
    const selectedResources = selectResources(
      skillProfile,
      weakDimensions,
      targetRole,
      totalBudgetHours,
      focusOnWeakAreas
    );

    // Clear existing roadmap items (preserving completed ones optionally)
    await clearUserRoadmap(userId, true);

    // Create new roadmap items
    const roadmapItems: RoadmapItem[] = [];
    let order = 0;

    for (const resource of selectedResources) {
      const item = await prisma.studentRoadmap.create({
        data: {
          userId,
          title: resource.title,
          description: resource.description,
          itemType: mapResourceTypeToItemType(resource.type),
          status: RoadmapStatus.NOT_STARTED,
          phase: resource.phase,
          order: order++,
          skillKeys: resource.skillKeys,
          difficulty: resource.difficulty,
          estimatedHours: resource.estimatedHours,
          metadata: {
            resourceId: resource.id,
            ...resource.metadata,
          },
        },
      });

      roadmapItems.push(mapToRoadmapItem(item));
    }

    logger.info('Roadmap generated', {
      userId,
      itemCount: roadmapItems.length,
      totalHours: calculateTotalHours(selectedResources.map((r) => r.id)),
    });

    return roadmapItems;
  } catch (error) {
    logger.error('Failed to generate roadmap', error, { userId });
    throw new Error('Failed to generate roadmap');
  }
}

/**
 * Select resources based on skill profile and constraints
 */
function selectResources(
  skillProfile: Awaited<ReturnType<typeof getSkillProfile>>,
  weakDimensions: Awaited<ReturnType<typeof getWeakDimensions>>,
  targetRole: string,
  budgetHours: number,
  focusOnWeakAreas: boolean
): LearningResource[] {
  const selected: LearningResource[] = [];
  const selectedIds = new Set<string>();
  let usedHours = 0;

  // Get weak skill keys
  const weakSkillKeys = new Set<string>();
  if (focusOnWeakAreas) {
    for (const { dimension } of weakDimensions) {
      const skills = getSkillsByDimension(dimension);
      skills.forEach((s) => {
        const data = skillProfile.skills[s.key];
        if (!data || data.mastery < 0.5) {
          weakSkillKeys.add(s.key);
        }
      });
    }
  }

  // Process each phase
  for (const phase of [1, 2, 3] as const) {
    const phaseResources = getResourcesByPhase(phase);

    // Score and sort resources
    const scoredResources = phaseResources.map((resource) => {
      let score = 0;

      // Bonus for targeting weak skills
      if (focusOnWeakAreas) {
        const weakSkillMatches = resource.skillKeys.filter((sk) => weakSkillKeys.has(sk)).length;
        score += weakSkillMatches * 10;
      }

      // Bonus for matching target role focus areas
      const roleFocusAreas = getRoleFocusAreas(targetRole);
      const dimensionMatches = resource.skillKeys.filter((sk) => {
        const skill = SKILL_TAGS.find((s) => s.key === sk);
        return skill && roleFocusAreas.includes(skill.dimension);
      }).length;
      score += dimensionMatches * 5;

      // Prefer resources with prerequisites met
      const prereqsMet = !resource.prerequisites ||
        resource.prerequisites.every((p) => selectedIds.has(p));
      if (prereqsMet) score += 20;

      // Slight preference for projects and exercises over readings
      if (resource.type === 'PROJECT') score += 3;
      if (resource.type === 'EXERCISE') score += 2;

      return { resource, score };
    });

    // Sort by score descending
    scoredResources.sort((a, b) => b.score - a.score);

    // Select resources within budget
    for (const { resource } of scoredResources) {
      // Skip if already selected
      if (selectedIds.has(resource.id)) continue;

      // Check prerequisites
      if (resource.prerequisites) {
        const prereqsMet = resource.prerequisites.every((p) => selectedIds.has(p));
        if (!prereqsMet) {
          // Add missing prerequisites first
          for (const prereqId of resource.prerequisites) {
            if (!selectedIds.has(prereqId)) {
              const prereq = getResourceById(prereqId);
              if (prereq && usedHours + prereq.estimatedHours <= budgetHours) {
                selected.push(prereq);
                selectedIds.add(prereq.id);
                usedHours += prereq.estimatedHours;
              }
            }
          }
        }
      }

      // Add resource if within budget
      if (usedHours + resource.estimatedHours <= budgetHours) {
        selected.push(resource);
        selectedIds.add(resource.id);
        usedHours += resource.estimatedHours;
      }

      // Stop if budget exhausted
      if (usedHours >= budgetHours * 0.95) break;
    }
  }

  // Sort by phase and original order
  selected.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    const aIndex = LEARNING_RESOURCES.findIndex((r) => r.id === a.id);
    const bIndex = LEARNING_RESOURCES.findIndex((r) => r.id === b.id);
    return aIndex - bIndex;
  });

  return selected;
}

/**
 * Get focus areas for a target role
 */
function getRoleFocusAreas(role: string): SkillDimension[] {
  switch (role) {
    case 'frontend':
      return ['javascript', 'web_foundations', 'design'];
    case 'backend':
      return ['backend', 'system_thinking', 'dev_practices'];
    case 'junior_fullstack':
    default:
      return getAllDimensionKeys();
  }
}

/**
 * Map resource type to Prisma RoadmapItemType
 */
function mapResourceTypeToItemType(type: ResourceType): RoadmapItemType {
  const mapping: Record<ResourceType, RoadmapItemType> = {
    PROJECT: RoadmapItemType.PROJECT,
    EXERCISE: RoadmapItemType.EXERCISE,
    READING: RoadmapItemType.SKILL, // Using SKILL for readings
    DESIGN: RoadmapItemType.DESIGN,
    COURSE: RoadmapItemType.COURSE,
    MILESTONE: RoadmapItemType.MILESTONE,
  };
  return mapping[type] || RoadmapItemType.SKILL;
}

/**
 * Map Prisma model to RoadmapItem
 */
function mapToRoadmapItem(item: any): RoadmapItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    itemType: item.itemType,
    status: item.status,
    phase: item.phase,
    order: item.order,
    skillKeys: item.skillKeys,
    difficulty: item.difficulty,
    estimatedHours: item.estimatedHours,
    metadata: item.metadata as Record<string, any> | null,
  };
}

// ============================================
// ROADMAP CRUD OPERATIONS
// ============================================

/**
 * Get user's roadmap items
 */
export async function getRoadmap(userId: string): Promise<RoadmapItem[]> {
  try {
    const items = await prisma.studentRoadmap.findMany({
      where: { userId },
      orderBy: [{ phase: 'asc' }, { order: 'asc' }],
    });

    return items.map(mapToRoadmapItem);
  } catch (error) {
    logger.error('Failed to get roadmap', error, { userId });
    throw new Error('Failed to get roadmap');
  }
}

/**
 * Get roadmap summary
 */
export async function getRoadmapSummary(userId: string): Promise<RoadmapSummary> {
  try {
    const items = await getRoadmap(userId);

    const completedItems = items.filter((i) => i.status === RoadmapStatus.COMPLETED);
    const inProgressItems = items.filter((i) => i.status === RoadmapStatus.IN_PROGRESS);

    const totalHours = items.reduce((sum, i) => sum + i.estimatedHours, 0);
    const completedHours = completedItems.reduce((sum, i) => sum + i.estimatedHours, 0);

    // Group by phase
    const phaseMap = new Map<number, { count: number; completed: number }>();
    for (const item of items) {
      const existing = phaseMap.get(item.phase) || { count: 0, completed: 0 };
      existing.count++;
      if (item.status === RoadmapStatus.COMPLETED) existing.completed++;
      phaseMap.set(item.phase, existing);
    }

    const phases = PHASES.map((p) => {
      const data = phaseMap.get(p.phase) || { count: 0, completed: 0 };
      return {
        phase: p.phase,
        title: p.title,
        itemCount: data.count,
        completedCount: data.completed,
      };
    });

    return {
      userId,
      totalItems: items.length,
      completedItems: completedItems.length,
      inProgressItems: inProgressItems.length,
      totalHours,
      completedHours,
      phases,
    };
  } catch (error) {
    logger.error('Failed to get roadmap summary', error, { userId });
    throw new Error('Failed to get roadmap summary');
  }
}

/**
 * Update roadmap item status
 */
export async function updateRoadmapItemStatus(
  itemId: string,
  status: RoadmapStatus
): Promise<RoadmapItem> {
  try {
    const item = await prisma.studentRoadmap.update({
      where: { id: itemId },
      data: {
        status,
        completedAt: status === RoadmapStatus.COMPLETED ? new Date() : null,
      },
    });

    return mapToRoadmapItem(item);
  } catch (error) {
    logger.error('Failed to update roadmap item', error, { itemId, status });
    throw new Error('Failed to update roadmap item');
  }
}

/**
 * Clear user's roadmap (optionally preserve completed items)
 */
export async function clearUserRoadmap(
  userId: string,
  preserveCompleted: boolean = false
): Promise<void> {
  try {
    if (preserveCompleted) {
      await prisma.studentRoadmap.deleteMany({
        where: {
          userId,
          status: { not: RoadmapStatus.COMPLETED },
        },
      });
    } else {
      await prisma.studentRoadmap.deleteMany({
        where: { userId },
      });
    }

    logger.info('Roadmap cleared', { userId, preserveCompleted });
  } catch (error) {
    logger.error('Failed to clear roadmap', error, { userId });
    throw new Error('Failed to clear roadmap');
  }
}

/**
 * Regenerate roadmap while preserving progress
 */
export async function regenerateRoadmap(
  userId: string,
  options: GenerateRoadmapOptions = {}
): Promise<RoadmapItem[]> {
  try {
    // Get current completed items
    const currentItems = await getRoadmap(userId);
    const completedIds = new Set(
      currentItems
        .filter((i) => i.status === RoadmapStatus.COMPLETED)
        .map((i) => (i.metadata as any)?.resourceId)
        .filter(Boolean)
    );

    // Generate new roadmap (preserving completed)
    const newItems = await generateRoadmap(userId, options);

    // Mark previously completed items
    for (const item of newItems) {
      const resourceId = (item.metadata as any)?.resourceId;
      if (resourceId && completedIds.has(resourceId)) {
        await updateRoadmapItemStatus(item.id, RoadmapStatus.COMPLETED);
      }
    }

    // Return updated roadmap
    return getRoadmap(userId);
  } catch (error) {
    logger.error('Failed to regenerate roadmap', error, { userId });
    throw new Error('Failed to regenerate roadmap');
  }
}

/**
 * Get next recommended item to work on
 */
export async function getNextRoadmapItem(userId: string): Promise<RoadmapItem | null> {
  try {
    // First, check for in-progress items
    const inProgress = await prisma.studentRoadmap.findFirst({
      where: {
        userId,
        status: RoadmapStatus.IN_PROGRESS,
      },
      orderBy: [{ phase: 'asc' }, { order: 'asc' }],
    });

    if (inProgress) {
      return mapToRoadmapItem(inProgress);
    }

    // Otherwise, get next not-started item
    const next = await prisma.studentRoadmap.findFirst({
      where: {
        userId,
        status: RoadmapStatus.NOT_STARTED,
      },
      orderBy: [{ phase: 'asc' }, { order: 'asc' }],
    });

    return next ? mapToRoadmapItem(next) : null;
  } catch (error) {
    logger.error('Failed to get next roadmap item', error, { userId });
    return null;
  }
}
