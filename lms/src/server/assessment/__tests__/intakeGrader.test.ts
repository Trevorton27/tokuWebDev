/**
 * Tests for Intake Grader (pure functions only)
 */

import {
  gradeMcq,
  gradeQuestionnaire,
  gradeDesignComparison,
  type McqAnswer,
  type QuestionnaireAnswer,
  type DesignComparisonAnswer,
} from '../intakeGrader';
import {
  type McqStepConfig,
  type QuestionnaireStepConfig,
  type DesignComparisonStepConfig,
} from '../intakeConfig';

describe('intakeGrader', () => {
  describe('gradeMcq', () => {
    const mockMcqConfig: McqStepConfig = {
      id: 'test_mcq',
      kind: 'MCQ',
      title: 'Test MCQ',
      description: 'A test question',
      skillKeys: ['prog_variables', 'prog_operators'],
      order: 1,
      estimatedMinutes: 1,
      difficulty: 'beginner',
      question: 'What is 2 + 2?',
      options: [
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false },
      ],
      explanation: 'Basic arithmetic: 2 + 2 = 4',
    };

    it('should return score 1 for correct answer', () => {
      const answer: McqAnswer = { selectedOptionId: 'b' };
      const result = gradeMcq(mockMcqConfig, answer);

      expect(result.score).toBe(1);
      expect(result.passed).toBe(true);
    });

    it('should return score 0 for incorrect answer', () => {
      const answer: McqAnswer = { selectedOptionId: 'a' };
      const result = gradeMcq(mockMcqConfig, answer);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should include explanation in feedback for incorrect answer', () => {
      const answer: McqAnswer = { selectedOptionId: 'c' };
      const result = gradeMcq(mockMcqConfig, answer);

      expect(result.feedback).toContain('4'); // Correct answer text
      expect(result.feedback).toContain('Basic arithmetic'); // Explanation
    });

    it('should return skill scores for all skill keys', () => {
      const answer: McqAnswer = { selectedOptionId: 'b' };
      const result = gradeMcq(mockMcqConfig, answer);

      expect(result.skillScores).toBeDefined();
      expect(result.skillScores!['prog_variables']).toBe(1);
      expect(result.skillScores!['prog_operators']).toBe(1);
    });

    it('should handle missing option selection', () => {
      const answer: McqAnswer = { selectedOptionId: 'invalid' };
      const result = gradeMcq(mockMcqConfig, answer);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.feedback).toContain('No answer');
    });

    it('should set confidence based on difficulty', () => {
      const beginnerConfig = { ...mockMcqConfig, difficulty: 'beginner' as const };
      const advancedConfig = { ...mockMcqConfig, difficulty: 'advanced' as const };

      const beginnerResult = gradeMcq(beginnerConfig, { selectedOptionId: 'b' });
      const advancedResult = gradeMcq(advancedConfig, { selectedOptionId: 'b' });

      expect(beginnerResult.confidence).toBeLessThan(advancedResult.confidence!);
    });
  });

  describe('gradeQuestionnaire', () => {
    const mockQuestionnaireConfig: QuestionnaireStepConfig = {
      id: 'test_questionnaire',
      kind: 'QUESTIONNAIRE',
      title: 'Test Questionnaire',
      description: 'A test questionnaire',
      skillKeys: [],
      order: 1,
      estimatedMinutes: 3,
      fields: [
        {
          id: 'confidence_js',
          type: 'slider',
          label: 'JavaScript confidence',
          min: 1,
          max: 5,
          required: true,
          skillMapping: {
            skillKey: 'js_confidence',
            valueToConfidence: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
          },
        },
        {
          id: 'experience',
          type: 'select',
          label: 'Experience level',
          required: true,
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
          ],
        },
      ],
    };

    it('should always return passed=true', () => {
      const answer: QuestionnaireAnswer = {
        confidence_js: 3,
        experience: 'beginner',
      };
      const result = gradeQuestionnaire(mockQuestionnaireConfig, answer);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
    });

    it('should map slider values to skill scores', () => {
      const answer: QuestionnaireAnswer = {
        confidence_js: 4,
        experience: 'beginner',
      };
      const result = gradeQuestionnaire(mockQuestionnaireConfig, answer);

      expect(result.skillScores).toBeDefined();
      // Value 4 -> selfReportToMastery(4) -> mastery = 0.75
      expect(result.skillScores!['js_confidence']).toBeCloseTo(0.75);
    });

    it('should have low confidence for self-reports', () => {
      const answer: QuestionnaireAnswer = { confidence_js: 3 };
      const result = gradeQuestionnaire(mockQuestionnaireConfig, answer);

      expect(result.confidence).toBe(0.2);
    });

    it('should store raw answers in details', () => {
      const answer: QuestionnaireAnswer = {
        confidence_js: 5,
        experience: 'intermediate',
      };
      const result = gradeQuestionnaire(mockQuestionnaireConfig, answer);

      expect(result.details?.rawAnswers).toEqual(answer);
    });

    it('should handle empty answers', () => {
      const answer: QuestionnaireAnswer = {};
      const result = gradeQuestionnaire(mockQuestionnaireConfig, answer);

      expect(result.passed).toBe(true);
      expect(Object.keys(result.skillScores || {})).toHaveLength(0);
    });
  });

  describe('gradeDesignComparison', () => {
    const mockDesignConfig: DesignComparisonStepConfig = {
      id: 'test_design',
      kind: 'DESIGN_COMPARISON',
      title: 'Test Design Comparison',
      description: 'Compare two designs',
      skillKeys: ['design_visual_hierarchy', 'design_ux_basics'],
      order: 1,
      estimatedMinutes: 2,
      prompt: 'Which design is better?',
      optionA: {
        description: 'Bad design',
      },
      optionB: {
        description: 'Good design',
      },
      correctOption: 'B',
      explanation: 'Option B has better contrast and hierarchy',
    };

    it('should return score 1 for correct answer', () => {
      const answer: DesignComparisonAnswer = { selectedOption: 'B' };
      const result = gradeDesignComparison(mockDesignConfig, answer);

      expect(result.score).toBe(1);
      expect(result.passed).toBe(true);
    });

    it('should return score 0 for incorrect answer', () => {
      const answer: DesignComparisonAnswer = { selectedOption: 'A' };
      const result = gradeDesignComparison(mockDesignConfig, answer);

      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should include explanation in feedback', () => {
      const incorrectAnswer: DesignComparisonAnswer = { selectedOption: 'A' };
      const result = gradeDesignComparison(mockDesignConfig, incorrectAnswer);

      expect(result.feedback).toContain('contrast');
    });

    it('should return skill scores for all skill keys', () => {
      const answer: DesignComparisonAnswer = { selectedOption: 'B' };
      const result = gradeDesignComparison(mockDesignConfig, answer);

      expect(result.skillScores).toBeDefined();
      expect(result.skillScores!['design_visual_hierarchy']).toBe(1);
      expect(result.skillScores!['design_ux_basics']).toBe(1);
    });

    it('should include selected and correct options in details', () => {
      const answer: DesignComparisonAnswer = { selectedOption: 'A' };
      const result = gradeDesignComparison(mockDesignConfig, answer);

      expect(result.details?.selectedOption).toBe('A');
      expect(result.details?.correctOption).toBe('B');
    });
  });

  describe('grading consistency', () => {
    it('should always return required GradeResult fields', () => {
      const mcqConfig: McqStepConfig = {
        id: 'test',
        kind: 'MCQ',
        title: 'Test',
        description: 'Test',
        skillKeys: ['prog_variables'],
        order: 1,
        estimatedMinutes: 1,
        difficulty: 'beginner',
        question: 'Test?',
        options: [
          { id: 'a', text: 'A', isCorrect: true },
          { id: 'b', text: 'B', isCorrect: false },
        ],
      };

      const result = gradeMcq(mcqConfig, { selectedOptionId: 'a' });

      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(typeof result.passed).toBe('boolean');
    });

    it('should normalize scores to 0-1 range', () => {
      // Test various graders return normalized scores
      const mcqConfig: McqStepConfig = {
        id: 'test',
        kind: 'MCQ',
        title: 'Test',
        description: 'Test',
        skillKeys: [],
        order: 1,
        estimatedMinutes: 1,
        difficulty: 'beginner',
        question: 'Test?',
        options: [
          { id: 'a', text: 'A', isCorrect: true },
        ],
      };

      const result = gradeMcq(mcqConfig, { selectedOptionId: 'a' });
      expect(result.score).toBe(1); // Not 100, normalized to 1
    });
  });
});
