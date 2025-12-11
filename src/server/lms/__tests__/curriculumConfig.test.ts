/**
 * Tests for Curriculum Configuration
 */

import {
  LEARNING_RESOURCES,
  PHASES,
  getResourcesByPhase,
  getResourceById,
  getResourcesForSkills,
  getResourcesByType,
  getPhaseConfig,
  calculateTotalHours,
  prerequisitesMet,
  type LearningResource,
} from '../curriculumConfig';
import { getAllSkillKeys } from '@/server/assessment/skillModel';

describe('curriculumConfig', () => {
  describe('LEARNING_RESOURCES configuration', () => {
    it('should have all required fields for each resource', () => {
      for (const resource of LEARNING_RESOURCES) {
        expect(resource.id).toBeDefined();
        expect(resource.id.length).toBeGreaterThan(0);
        expect(resource.title).toBeDefined();
        expect(resource.description).toBeDefined();
        expect(resource.type).toBeDefined();
        expect([1, 2, 3]).toContain(resource.phase);
        expect(Array.isArray(resource.skillKeys)).toBe(true);
        expect(resource.difficulty).toBeGreaterThanOrEqual(1);
        expect(resource.difficulty).toBeLessThanOrEqual(5);
        expect(typeof resource.estimatedHours).toBe('number');
      }
    });

    it('should have unique resource IDs', () => {
      const ids = LEARNING_RESOURCES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid skill keys', () => {
      const allSkillKeys = getAllSkillKeys();
      for (const resource of LEARNING_RESOURCES) {
        for (const skillKey of resource.skillKeys) {
          expect(allSkillKeys.has(skillKey)).toBe(true);
        }
      }
    });

    it('should have valid prerequisite IDs', () => {
      const allIds = new Set(LEARNING_RESOURCES.map((r) => r.id));
      for (const resource of LEARNING_RESOURCES) {
        if (resource.prerequisites) {
          for (const prereq of resource.prerequisites) {
            expect(allIds.has(prereq)).toBe(true);
          }
        }
      }
    });

    it('should have at least one resource per phase', () => {
      expect(getResourcesByPhase(1).length).toBeGreaterThan(0);
      expect(getResourcesByPhase(2).length).toBeGreaterThan(0);
      expect(getResourcesByPhase(3).length).toBeGreaterThan(0);
    });

    it('should have milestone at end of each phase', () => {
      for (const phase of [1, 2, 3] as const) {
        const phaseResources = getResourcesByPhase(phase);
        const milestones = phaseResources.filter((r) => r.type === 'MILESTONE');
        expect(milestones.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should have at least one project per phase', () => {
      for (const phase of [1, 2, 3] as const) {
        const phaseResources = getResourcesByPhase(phase);
        const projects = phaseResources.filter((r) => r.type === 'PROJECT');
        expect(projects.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('PHASES configuration', () => {
    it('should have 3 phases', () => {
      expect(PHASES.length).toBe(3);
    });

    it('should have phases 1, 2, 3', () => {
      expect(PHASES.map((p) => p.phase).sort()).toEqual([1, 2, 3]);
    });

    it('should have all required fields', () => {
      for (const phase of PHASES) {
        expect(phase.phase).toBeDefined();
        expect(phase.title).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(Array.isArray(phase.focusAreas)).toBe(true);
        expect(phase.focusAreas.length).toBeGreaterThan(0);
        expect(typeof phase.estimatedWeeks).toBe('number');
      }
    });
  });

  describe('getResourcesByPhase', () => {
    it('should return only resources for the specified phase', () => {
      const phase1 = getResourcesByPhase(1);
      expect(phase1.every((r) => r.phase === 1)).toBe(true);

      const phase2 = getResourcesByPhase(2);
      expect(phase2.every((r) => r.phase === 2)).toBe(true);
    });
  });

  describe('getResourceById', () => {
    it('should return resource for valid ID', () => {
      const resource = getResourceById('read_variables_types');
      expect(resource).toBeDefined();
      expect(resource?.id).toBe('read_variables_types');
    });

    it('should return undefined for invalid ID', () => {
      const resource = getResourceById('invalid_id');
      expect(resource).toBeUndefined();
    });
  });

  describe('getResourcesForSkills', () => {
    it('should return resources targeting specified skills', () => {
      const resources = getResourcesForSkills(['prog_arrays']);
      expect(resources.length).toBeGreaterThan(0);
      expect(
        resources.every((r) => r.skillKeys.includes('prog_arrays'))
      ).toBe(true);
    });

    it('should return resources for multiple skills', () => {
      const resources = getResourcesForSkills(['prog_arrays', 'js_dom']);
      expect(resources.length).toBeGreaterThan(0);
      expect(
        resources.every((r) =>
          r.skillKeys.some((sk) => ['prog_arrays', 'js_dom'].includes(sk))
        )
      ).toBe(true);
    });

    it('should return empty array for unknown skills', () => {
      const resources = getResourcesForSkills(['unknown_skill']);
      expect(resources).toEqual([]);
    });
  });

  describe('getResourcesByType', () => {
    it('should return only resources of specified type', () => {
      const projects = getResourcesByType('PROJECT');
      expect(projects.length).toBeGreaterThan(0);
      expect(projects.every((r) => r.type === 'PROJECT')).toBe(true);
    });

    it('should return exercises', () => {
      const exercises = getResourcesByType('EXERCISE');
      expect(exercises.length).toBeGreaterThan(0);
    });

    it('should return readings', () => {
      const readings = getResourcesByType('READING');
      expect(readings.length).toBeGreaterThan(0);
    });
  });

  describe('getPhaseConfig', () => {
    it('should return config for valid phase', () => {
      const config = getPhaseConfig(1);
      expect(config).toBeDefined();
      expect(config?.phase).toBe(1);
      expect(config?.title).toBe('Foundations');
    });

    it('should return undefined for invalid phase', () => {
      const config = getPhaseConfig(4 as any);
      expect(config).toBeUndefined();
    });
  });

  describe('calculateTotalHours', () => {
    it('should sum hours for given resource IDs', () => {
      const ids = ['read_variables_types', 'ex_variables_practice'];
      const total = calculateTotalHours(ids);

      const r1 = getResourceById('read_variables_types');
      const r2 = getResourceById('ex_variables_practice');
      const expected = (r1?.estimatedHours || 0) + (r2?.estimatedHours || 0);

      expect(total).toBe(expected);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalHours([])).toBe(0);
    });

    it('should handle invalid IDs gracefully', () => {
      const total = calculateTotalHours(['invalid_id', 'read_variables_types']);
      const r1 = getResourceById('read_variables_types');
      expect(total).toBe(r1?.estimatedHours || 0);
    });
  });

  describe('prerequisitesMet', () => {
    it('should return true if no prerequisites', () => {
      const completed = new Set<string>();
      // read_variables_types has no prerequisites
      expect(prerequisitesMet('read_variables_types', completed)).toBe(true);
    });

    it('should return true if all prerequisites completed', () => {
      const completed = new Set(['read_variables_types']);
      // ex_variables_practice requires read_variables_types
      expect(prerequisitesMet('ex_variables_practice', completed)).toBe(true);
    });

    it('should return false if prerequisites not met', () => {
      const completed = new Set<string>();
      // ex_variables_practice requires read_variables_types
      expect(prerequisitesMet('ex_variables_practice', completed)).toBe(false);
    });

    it('should return true for unknown resource ID', () => {
      const completed = new Set<string>();
      expect(prerequisitesMet('unknown_id', completed)).toBe(true);
    });
  });

  describe('resource dependencies', () => {
    it('should not have circular dependencies', () => {
      const visited = new Set<string>();
      const stack = new Set<string>();

      function hasCycle(resourceId: string): boolean {
        if (stack.has(resourceId)) return true;
        if (visited.has(resourceId)) return false;

        visited.add(resourceId);
        stack.add(resourceId);

        const resource = getResourceById(resourceId);
        if (resource?.prerequisites) {
          for (const prereq of resource.prerequisites) {
            if (hasCycle(prereq)) return true;
          }
        }

        stack.delete(resourceId);
        return false;
      }

      for (const resource of LEARNING_RESOURCES) {
        expect(hasCycle(resource.id)).toBe(false);
      }
    });

    it('should have prerequisites from same or earlier phase', () => {
      for (const resource of LEARNING_RESOURCES) {
        if (resource.prerequisites) {
          for (const prereqId of resource.prerequisites) {
            const prereq = getResourceById(prereqId);
            expect(prereq).toBeDefined();
            expect(prereq!.phase).toBeLessThanOrEqual(resource.phase);
          }
        }
      }
    });
  });
});
