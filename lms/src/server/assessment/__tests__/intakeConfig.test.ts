/**
 * Tests for Intake Configuration
 */

import {
  INTAKE_STEPS,
  getOrderedSteps,
  getStepById,
  getFirstStep,
  getNextStep,
  getTotalEstimatedMinutes,
  getStepsByKind,
  isLastStep,
  getStepProgress,
  type IntakeStepConfig,
} from '../intakeConfig';
import { getAllSkillKeys } from '../skillModel';

describe('intakeConfig', () => {
  describe('INTAKE_STEPS configuration', () => {
    it('should have all required fields for each step', () => {
      for (const step of INTAKE_STEPS) {
        expect(step.id).toBeDefined();
        expect(step.id.length).toBeGreaterThan(0);
        expect(step.kind).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(Array.isArray(step.skillKeys)).toBe(true);
        expect(typeof step.order).toBe('number');
        expect(typeof step.estimatedMinutes).toBe('number');
        expect(step.estimatedMinutes).toBeGreaterThan(0);
      }
    });

    it('should have unique step IDs', () => {
      const ids = INTAKE_STEPS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid skill keys', () => {
      const allSkillKeys = getAllSkillKeys();
      const aggregateKeys = new Set([
        'prog_fundamentals_aggregate',
        'web_foundations_aggregate',
        'javascript_aggregate',
        'backend_aggregate',
        'design_aggregate',
      ]);

      for (const step of INTAKE_STEPS) {
        for (const skillKey of step.skillKeys) {
          // Allow aggregate keys and valid skill keys
          if (!aggregateKeys.has(skillKey)) {
            expect(allSkillKeys.has(skillKey)).toBe(true);
          }
        }
      }
    });

    it('should have at least one step of each major kind', () => {
      const kinds = new Set(INTAKE_STEPS.map((s) => s.kind));
      expect(kinds.has('QUESTIONNAIRE')).toBe(true);
      expect(kinds.has('MCQ')).toBe(true);
      expect(kinds.has('CODE')).toBe(true);
      expect(kinds.has('SUMMARY')).toBe(true);
    });

    it('should have exactly one SUMMARY step', () => {
      const summarySteps = INTAKE_STEPS.filter((s) => s.kind === 'SUMMARY');
      expect(summarySteps.length).toBe(1);
    });

    it('should have SUMMARY as the last step by order', () => {
      const ordered = getOrderedSteps();
      const lastStep = ordered[ordered.length - 1];
      expect(lastStep.kind).toBe('SUMMARY');
    });
  });

  describe('MCQ steps', () => {
    it('should have valid options with exactly one correct answer', () => {
      const mcqSteps = getStepsByKind('MCQ');

      for (const step of mcqSteps) {
        const mcq = step as any;
        expect(Array.isArray(mcq.options)).toBe(true);
        expect(mcq.options.length).toBeGreaterThan(1);

        const correctOptions = mcq.options.filter((o: any) => o.isCorrect);
        expect(correctOptions.length).toBe(1);

        for (const option of mcq.options) {
          expect(option.id).toBeDefined();
          expect(option.text).toBeDefined();
          expect(typeof option.isCorrect).toBe('boolean');
        }
      }
    });

    it('should have difficulty levels', () => {
      const mcqSteps = getStepsByKind('MCQ');
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];

      for (const step of mcqSteps) {
        const mcq = step as any;
        expect(validDifficulties).toContain(mcq.difficulty);
      }
    });
  });

  describe('CODE steps', () => {
    it('should have valid test cases', () => {
      const codeSteps = getStepsByKind('CODE');

      for (const step of codeSteps) {
        const code = step as any;
        expect(Array.isArray(code.testCases)).toBe(true);
        expect(code.testCases.length).toBeGreaterThan(0);

        for (const tc of code.testCases) {
          expect(tc.input).toBeDefined();
          expect(tc.expectedOutput).toBeDefined();
          expect(typeof tc.isHidden).toBe('boolean');
        }
      }
    });

    it('should have starter code and language', () => {
      const codeSteps = getStepsByKind('CODE');

      for (const step of codeSteps) {
        const code = step as any;
        expect(code.starterCode).toBeDefined();
        expect(code.language).toBeDefined();
        expect(['javascript', 'typescript']).toContain(code.language);
      }
    });
  });

  describe('getOrderedSteps', () => {
    it('should return steps sorted by order', () => {
      const ordered = getOrderedSteps();

      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i].order).toBeGreaterThanOrEqual(ordered[i - 1].order);
      }
    });

    it('should return a copy (not mutate original)', () => {
      const ordered1 = getOrderedSteps();
      const ordered2 = getOrderedSteps();

      ordered1[0] = {} as IntakeStepConfig;
      expect(ordered2[0].id).toBeDefined();
    });
  });

  describe('getStepById', () => {
    it('should return step for valid ID', () => {
      const step = getStepById('questionnaire_background');
      expect(step).toBeDefined();
      expect(step?.id).toBe('questionnaire_background');
    });

    it('should return undefined for invalid ID', () => {
      const step = getStepById('invalid_id');
      expect(step).toBeUndefined();
    });
  });

  describe('getFirstStep', () => {
    it('should return the step with lowest order', () => {
      const first = getFirstStep();
      const ordered = getOrderedSteps();
      expect(first.id).toBe(ordered[0].id);
    });
  });

  describe('getNextStep', () => {
    it('should return the next step in order', () => {
      const ordered = getOrderedSteps();
      const firstId = ordered[0].id;
      const next = getNextStep(firstId);

      expect(next).toBeDefined();
      expect(next?.id).toBe(ordered[1].id);
    });

    it('should return null for the last step', () => {
      const ordered = getOrderedSteps();
      const lastId = ordered[ordered.length - 1].id;
      const next = getNextStep(lastId);

      expect(next).toBeNull();
    });

    it('should return null for invalid step ID', () => {
      const next = getNextStep('invalid_id');
      expect(next).toBeNull();
    });
  });

  describe('getTotalEstimatedMinutes', () => {
    it('should return sum of all step times', () => {
      const total = getTotalEstimatedMinutes();
      const manual = INTAKE_STEPS.reduce((sum, s) => sum + s.estimatedMinutes, 0);
      expect(total).toBe(manual);
    });

    it('should be in reasonable range (30-60 mins as spec)', () => {
      const total = getTotalEstimatedMinutes();
      expect(total).toBeGreaterThanOrEqual(30);
      expect(total).toBeLessThanOrEqual(60);
    });
  });

  describe('getStepsByKind', () => {
    it('should return only steps of the specified kind', () => {
      const mcqSteps = getStepsByKind('MCQ');

      expect(mcqSteps.length).toBeGreaterThan(0);
      expect(mcqSteps.every((s) => s.kind === 'MCQ')).toBe(true);
    });

    it('should return empty array for unused kind', () => {
      // We don't have UNKNOWN kind
      const steps = getStepsByKind('UNKNOWN' as any);
      expect(steps).toEqual([]);
    });
  });

  describe('isLastStep', () => {
    it('should return true for summary step', () => {
      expect(isLastStep('summary')).toBe(true);
    });

    it('should return false for first step', () => {
      const first = getFirstStep();
      expect(isLastStep(first.id)).toBe(false);
    });

    it('should return false for invalid step', () => {
      expect(isLastStep('invalid_id')).toBe(false);
    });
  });

  describe('getStepProgress', () => {
    it('should return 0 for invalid step', () => {
      expect(getStepProgress('invalid_id')).toBe(0);
    });

    it('should return percentage based on position', () => {
      const ordered = getOrderedSteps();
      const firstProgress = getStepProgress(ordered[0].id);
      const lastProgress = getStepProgress(ordered[ordered.length - 1].id);

      expect(firstProgress).toBeGreaterThan(0);
      expect(firstProgress).toBeLessThan(50);
      expect(lastProgress).toBe(100);
    });

    it('should increase monotonically', () => {
      const ordered = getOrderedSteps();
      let prevProgress = 0;

      for (const step of ordered) {
        const progress = getStepProgress(step.id);
        expect(progress).toBeGreaterThanOrEqual(prevProgress);
        prevProgress = progress;
      }
    });
  });
});
