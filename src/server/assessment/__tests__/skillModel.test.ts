/**
 * Tests for Skill Model Configuration
 */

import {
  SKILL_TAGS,
  DIMENSIONS,
  getSkillsByDimension,
  getSkillByKey,
  getDimensionByKey,
  getAllSkillKeys,
  getAllDimensionKeys,
  mapTagsToSkillKeys,
  TAG_TO_SKILL_MAP,
  type SkillDimension,
} from '../skillModel';

describe('skillModel', () => {
  describe('SKILL_TAGS configuration', () => {
    it('should have all required fields for each skill tag', () => {
      for (const tag of SKILL_TAGS) {
        expect(tag.key).toBeDefined();
        expect(tag.key.length).toBeGreaterThan(0);
        expect(tag.dimension).toBeDefined();
        expect(tag.label).toBeDefined();
        expect(tag.description).toBeDefined();
        expect(typeof tag.weight).toBe('number');
        expect(tag.weight).toBeGreaterThan(0);
        expect(tag.weight).toBeLessThanOrEqual(1);
      }
    });

    it('should have unique skill keys', () => {
      const keys = SKILL_TAGS.map((t) => t.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should reference valid dimensions', () => {
      const dimensionKeys = new Set(DIMENSIONS.map((d) => d.key));
      for (const tag of SKILL_TAGS) {
        expect(dimensionKeys.has(tag.dimension)).toBe(true);
      }
    });

    it('should only reference valid prerequisite keys', () => {
      const allKeys = getAllSkillKeys();
      for (const tag of SKILL_TAGS) {
        if (tag.prerequisites) {
          for (const prereq of tag.prerequisites) {
            expect(allKeys.has(prereq)).toBe(true);
          }
        }
      }
    });
  });

  describe('DIMENSIONS configuration', () => {
    it('should have all 8 dimensions defined', () => {
      expect(DIMENSIONS.length).toBe(8);
    });

    it('should have unique dimension keys', () => {
      const keys = DIMENSIONS.map((d) => d.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it('should have all required fields', () => {
      for (const dim of DIMENSIONS) {
        expect(dim.key).toBeDefined();
        expect(dim.label).toBeDefined();
        expect(dim.description).toBeDefined();
        expect(typeof dim.order).toBe('number');
      }
    });

    it('should have each dimension populated with at least one skill', () => {
      for (const dim of DIMENSIONS) {
        const skills = getSkillsByDimension(dim.key);
        expect(skills.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getSkillsByDimension', () => {
    it('should return skills for programming_fundamentals', () => {
      const skills = getSkillsByDimension('programming_fundamentals');
      expect(skills.length).toBeGreaterThan(0);
      expect(skills.every((s) => s.dimension === 'programming_fundamentals')).toBe(true);
    });

    it('should return empty array for invalid dimension', () => {
      const skills = getSkillsByDimension('invalid' as SkillDimension);
      expect(skills).toEqual([]);
    });
  });

  describe('getSkillByKey', () => {
    it('should return skill config for valid key', () => {
      const skill = getSkillByKey('prog_arrays');
      expect(skill).toBeDefined();
      expect(skill?.key).toBe('prog_arrays');
      expect(skill?.dimension).toBe('programming_fundamentals');
    });

    it('should return undefined for invalid key', () => {
      const skill = getSkillByKey('invalid_key');
      expect(skill).toBeUndefined();
    });
  });

  describe('getDimensionByKey', () => {
    it('should return dimension config for valid key', () => {
      const dim = getDimensionByKey('javascript');
      expect(dim).toBeDefined();
      expect(dim?.key).toBe('javascript');
      expect(dim?.label).toBe('JavaScript/TypeScript');
    });

    it('should return undefined for invalid key', () => {
      const dim = getDimensionByKey('invalid' as SkillDimension);
      expect(dim).toBeUndefined();
    });
  });

  describe('getAllSkillKeys', () => {
    it('should return a Set of all skill keys', () => {
      const keys = getAllSkillKeys();
      expect(keys).toBeInstanceOf(Set);
      expect(keys.size).toBe(SKILL_TAGS.length);
    });
  });

  describe('getAllDimensionKeys', () => {
    it('should return all dimension keys', () => {
      const keys = getAllDimensionKeys();
      expect(keys.length).toBe(8);
      expect(keys).toContain('programming_fundamentals');
      expect(keys).toContain('javascript');
      expect(keys).toContain('design');
    });
  });

  describe('mapTagsToSkillKeys', () => {
    it('should map challenge tags to skill keys', () => {
      const skillKeys = mapTagsToSkillKeys(['arrays', 'loops']);
      expect(skillKeys).toContain('prog_arrays');
      expect(skillKeys).toContain('js_array_methods');
      expect(skillKeys).toContain('prog_control_flow');
    });

    it('should pass through valid skill keys', () => {
      const skillKeys = mapTagsToSkillKeys(['prog_functions', 'js_dom']);
      expect(skillKeys).toContain('prog_functions');
      expect(skillKeys).toContain('js_dom');
    });

    it('should handle mixed tags and skill keys', () => {
      const skillKeys = mapTagsToSkillKeys(['arrays', 'prog_functions', 'dom']);
      expect(skillKeys).toContain('prog_arrays');
      expect(skillKeys).toContain('js_array_methods');
      expect(skillKeys).toContain('prog_functions');
      expect(skillKeys).toContain('js_dom');
    });

    it('should return empty array for unknown tags', () => {
      const skillKeys = mapTagsToSkillKeys(['unknown_tag', 'another_unknown']);
      expect(skillKeys).toEqual([]);
    });

    it('should deduplicate skill keys', () => {
      const skillKeys = mapTagsToSkillKeys(['arrays', 'arrays', 'prog_arrays']);
      const uniqueKeys = new Set(skillKeys);
      expect(skillKeys.length).toBe(uniqueKeys.size);
    });

    it('should handle case insensitivity', () => {
      const skillKeys = mapTagsToSkillKeys(['ARRAYS', 'Arrays', 'arrays']);
      expect(skillKeys).toContain('prog_arrays');
    });
  });

  describe('TAG_TO_SKILL_MAP', () => {
    it('should map common challenge tags', () => {
      expect(TAG_TO_SKILL_MAP['arrays']).toBeDefined();
      expect(TAG_TO_SKILL_MAP['functions']).toBeDefined();
      expect(TAG_TO_SKILL_MAP['dom']).toBeDefined();
      expect(TAG_TO_SKILL_MAP['git']).toBeDefined();
    });

    it('should only reference valid skill keys', () => {
      const allKeys = getAllSkillKeys();
      for (const [_, skillKeys] of Object.entries(TAG_TO_SKILL_MAP)) {
        for (const skillKey of skillKeys) {
          expect(allKeys.has(skillKey)).toBe(true);
        }
      }
    });
  });
});
