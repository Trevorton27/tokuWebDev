/**
 * Tests for Skill Profile Service
 */

import {
  calculateMasteryUpdate,
  selfReportToMastery,
  calculateDimensionScores,
} from '../skillProfileService';
import type { SkillMasteryData } from '../skillModel';

describe('skillProfileService', () => {
  describe('calculateMasteryUpdate', () => {
    it('should increase mastery when score is higher than current', () => {
      const current: SkillMasteryData = {
        mastery: 0.3,
        confidence: 0.2,
        attempts: 2,
      };

      const result = calculateMasteryUpdate(current, 0.8);

      expect(result.mastery).toBeGreaterThan(current.mastery);
      expect(result.mastery).toBeLessThan(0.8); // Should move toward but not reach
    });

    it('should decrease mastery when score is lower than current', () => {
      const current: SkillMasteryData = {
        mastery: 0.7,
        confidence: 0.3,
        attempts: 5,
      };

      const result = calculateMasteryUpdate(current, 0.2);

      expect(result.mastery).toBeLessThan(current.mastery);
      expect(result.mastery).toBeGreaterThan(0.2); // Should move toward but not reach
    });

    it('should increase confidence with each update', () => {
      const current: SkillMasteryData = {
        mastery: 0.5,
        confidence: 0.3,
        attempts: 3,
      };

      const result = calculateMasteryUpdate(current, 0.5);

      expect(result.confidence).toBeGreaterThan(current.confidence);
    });

    it('should update more slowly when confidence is high', () => {
      const lowConfidence: SkillMasteryData = {
        mastery: 0.5,
        confidence: 0.1,
        attempts: 1,
      };
      const highConfidence: SkillMasteryData = {
        mastery: 0.5,
        confidence: 0.9,
        attempts: 20,
      };

      const lowResult = calculateMasteryUpdate(lowConfidence, 0.9);
      const highResult = calculateMasteryUpdate(highConfidence, 0.9);

      // Low confidence should change more
      expect(Math.abs(lowResult.mastery - 0.5)).toBeGreaterThan(
        Math.abs(highResult.mastery - 0.5)
      );
    });

    it('should respect weight parameter', () => {
      const current: SkillMasteryData = {
        mastery: 0.5,
        confidence: 0.3,
        attempts: 3,
      };

      const fullWeight = calculateMasteryUpdate(current, 0.9, 1.0);
      const halfWeight = calculateMasteryUpdate(current, 0.9, 0.5);

      expect(Math.abs(fullWeight.mastery - 0.5)).toBeGreaterThan(
        Math.abs(halfWeight.mastery - 0.5)
      );
    });

    it('should clamp mastery between 0 and 1', () => {
      const lowMastery: SkillMasteryData = {
        mastery: 0.05,
        confidence: 0.1,
        attempts: 1,
      };
      const highMastery: SkillMasteryData = {
        mastery: 0.95,
        confidence: 0.1,
        attempts: 1,
      };

      const lowResult = calculateMasteryUpdate(lowMastery, 0);
      const highResult = calculateMasteryUpdate(highMastery, 1);

      expect(lowResult.mastery).toBeGreaterThanOrEqual(0);
      expect(highResult.mastery).toBeLessThanOrEqual(1);
    });

    it('should clamp confidence at 1', () => {
      const highConfidence: SkillMasteryData = {
        mastery: 0.8,
        confidence: 0.98,
        attempts: 50,
      };

      const result = calculateMasteryUpdate(highConfidence, 0.9);

      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle zero confidence correctly', () => {
      const zeroConfidence: SkillMasteryData = {
        mastery: 0.5,
        confidence: 0,
        attempts: 0,
      };

      const result = calculateMasteryUpdate(zeroConfidence, 0.8);

      expect(result.mastery).toBeGreaterThan(0.5);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('selfReportToMastery', () => {
    it('should map 1-5 scale to 0-1 mastery', () => {
      const level1 = selfReportToMastery(1);
      const level3 = selfReportToMastery(3);
      const level5 = selfReportToMastery(5);

      expect(level1.mastery).toBe(0);
      expect(level3.mastery).toBe(0.5);
      expect(level5.mastery).toBe(1);
    });

    it('should set low confidence for self-reports', () => {
      const result = selfReportToMastery(3);
      expect(result.confidence).toBe(0.2);
    });

    it('should set attempts to 1', () => {
      const result = selfReportToMastery(4);
      expect(result.attempts).toBe(1);
    });

    it('should handle intermediate values', () => {
      const level2 = selfReportToMastery(2);
      const level4 = selfReportToMastery(4);

      expect(level2.mastery).toBeCloseTo(0.25);
      expect(level4.mastery).toBeCloseTo(0.75);
    });

    it('should clamp values below 1', () => {
      const result = selfReportToMastery(0);
      expect(result.mastery).toBe(0);
    });

    it('should clamp values above 5', () => {
      const result = selfReportToMastery(6);
      expect(result.mastery).toBe(1);
    });
  });

  describe('calculateDimensionScores', () => {
    it('should calculate weighted average for dimension', () => {
      const skills = {
        prog_arrays: { mastery: 0.8, confidence: 0.7, attempts: 5 },
        prog_objects: { mastery: 0.6, confidence: 0.5, attempts: 3 },
      };

      const dimensions = calculateDimensionScores(skills);

      // programming_fundamentals should have a score
      expect(dimensions.programming_fundamentals.score).toBeGreaterThan(0);
      expect(dimensions.programming_fundamentals.assessedCount).toBe(2);
    });

    it('should return zero score for unassessed dimensions', () => {
      const skills = {
        prog_arrays: { mastery: 0.8, confidence: 0.7, attempts: 5 },
      };

      const dimensions = calculateDimensionScores(skills);

      // design dimension has no assessed skills
      expect(dimensions.design.score).toBe(0);
      expect(dimensions.design.assessedCount).toBe(0);
    });

    it('should handle empty skills object', () => {
      const dimensions = calculateDimensionScores({});

      for (const dim of Object.values(dimensions)) {
        expect(dim.score).toBe(0);
        expect(dim.confidence).toBe(0);
        expect(dim.assessedCount).toBe(0);
      }
    });

    it('should not count skills with zero attempts', () => {
      const skills = {
        prog_arrays: { mastery: 0.8, confidence: 0.7, attempts: 5 },
        prog_objects: { mastery: 0, confidence: 0, attempts: 0 }, // Not assessed
      };

      const dimensions = calculateDimensionScores(skills);

      expect(dimensions.programming_fundamentals.assessedCount).toBe(1);
    });

    it('should calculate correct skillCount for each dimension', () => {
      const dimensions = calculateDimensionScores({});

      // Each dimension should have at least one skill
      for (const dim of Object.values(dimensions)) {
        expect(dim.skillCount).toBeGreaterThan(0);
      }
    });

    it('should weight skills by their configured weight', () => {
      // Create skills with different weights but same mastery
      const skills = {
        prog_arrays: { mastery: 1.0, confidence: 1.0, attempts: 10 },
        prog_operators: { mastery: 0, confidence: 1.0, attempts: 10 },
      };

      const dimensions = calculateDimensionScores(skills);

      // prog_arrays has weight 1.0, prog_operators has weight 0.8
      // Weighted average should favor prog_arrays
      expect(dimensions.programming_fundamentals.score).toBeGreaterThan(0.5);
    });

    it('should calculate confidence aggregate correctly', () => {
      const skills = {
        prog_arrays: { mastery: 0.8, confidence: 0.9, attempts: 10 },
        prog_objects: { mastery: 0.6, confidence: 0.3, attempts: 2 },
      };

      const dimensions = calculateDimensionScores(skills);

      // Confidence should be weighted average
      expect(dimensions.programming_fundamentals.confidence).toBeGreaterThan(0);
      expect(dimensions.programming_fundamentals.confidence).toBeLessThanOrEqual(1);
    });
  });
});
