/**
 * Intake Assessment Grader
 *
 * Handles grading for different assessment step types.
 * Uses AI (Anthropic) for short text, code quality, and design critique evaluation.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';
import { evaluateSubmission } from './runCodeService';
import { selfReportToMastery } from './skillProfileService';
import {
  type IntakeStepConfig,
  type McqStepConfig,
  type MicroMcqBurstStepConfig,
  type ShortTextStepConfig,
  type CodeStepConfig,
  type DesignComparisonStepConfig,
  type DesignCritiqueStepConfig,
  type CodeReviewStepConfig,
  type QuestionnaireStepConfig,
} from './intakeConfig';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const AI_GRADER_MODEL = process.env.AI_TUTOR_MODEL || 'claude-3-5-sonnet-20241022';

// Initialize Anthropic client
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// ============================================
// TYPES
// ============================================

export interface GradeResult {
  score: number; // 0-1 normalized score
  passed: boolean;
  feedback?: string;
  details?: Record<string, any>;
  skillScores?: Record<string, number>; // Per-skill scores for this step
  confidence?: number; // How confident we are in this grading (0-1)
}

export interface QuestionnaireAnswer {
  [fieldId: string]: any;
}

export interface McqAnswer {
  selectedOptionId: string;
}

export interface ShortTextAnswer {
  text: string;
}

export interface CodeAnswer {
  code: string;
}

export interface DesignComparisonAnswer {
  selectedOption: 'A' | 'B';
}

export interface DesignCritiqueAnswer {
  critique: string;
}

export interface CodeReviewAnswer {
  critique: string;
}

export interface MicroMcqBurstAnswer {
  answers: Record<string, string>; // questionId -> selectedOptionId
}

// ============================================
// MAIN GRADING FUNCTION
// ============================================

/**
 * Grade a step answer based on step type
 */
export async function gradeStep(
  stepConfig: IntakeStepConfig,
  answer: any,
  userId: string
): Promise<GradeResult> {
  switch (stepConfig.kind) {
    case 'QUESTIONNAIRE':
      return gradeQuestionnaire(stepConfig as QuestionnaireStepConfig, answer as QuestionnaireAnswer);

    case 'MCQ':
      return gradeMcq(stepConfig as McqStepConfig, answer as McqAnswer);

    case 'MICRO_MCQ_BURST':
      return gradeMicroMcqBurst(stepConfig as MicroMcqBurstStepConfig, answer as MicroMcqBurstAnswer);

    case 'SHORT_TEXT':
      return gradeShortText(stepConfig as ShortTextStepConfig, answer as ShortTextAnswer);

    case 'CODE':
      return gradeCode(stepConfig as CodeStepConfig, answer as CodeAnswer);

    case 'DESIGN_COMPARISON':
      return gradeDesignComparison(
        stepConfig as DesignComparisonStepConfig,
        answer as DesignComparisonAnswer
      );

    case 'DESIGN_CRITIQUE':
      return gradeDesignCritique(stepConfig as DesignCritiqueStepConfig, answer as DesignCritiqueAnswer);

    case 'CODE_REVIEW':
      return gradeCodeReview(stepConfig as CodeReviewStepConfig, answer as CodeReviewAnswer);

    case 'SUMMARY':
      // Summary step doesn't need grading
      return { score: 1, passed: true };

    default:
      logger.warn('Unknown step kind for grading', { kind: (stepConfig as any).kind });
      return { score: 0, passed: false, feedback: 'Unknown step type' };
  }
}

// ============================================
// QUESTIONNAIRE GRADING
// ============================================

/**
 * Process questionnaire answers and extract skill estimates
 */
export function gradeQuestionnaire(
  config: QuestionnaireStepConfig,
  answer: QuestionnaireAnswer
): GradeResult {
  const skillScores: Record<string, number> = {};

  for (const field of config.fields) {
    const fieldAnswer = answer[field.id];

    if (field.skillMapping && fieldAnswer !== undefined) {
      const { skillKey, valueToConfidence } = field.skillMapping;

      if (valueToConfidence && fieldAnswer in valueToConfidence) {
        // Map slider/select value to confidence level (1-5)
        const confidenceLevel = valueToConfidence[String(fieldAnswer)];
        const { mastery } = selfReportToMastery(confidenceLevel);
        skillScores[skillKey] = mastery;
      } else if (typeof fieldAnswer === 'number') {
        // Direct numeric value (slider)
        const { mastery } = selfReportToMastery(fieldAnswer);
        skillScores[skillKey] = mastery;
      }
    }
  }

  return {
    score: 1, // Questionnaires always "pass"
    passed: true,
    skillScores,
    confidence: 0.2, // Low confidence for self-reports
    details: { rawAnswers: answer },
  };
}

// ============================================
// MCQ GRADING
// ============================================

/**
 * Grade multiple choice question
 */
export function gradeMcq(config: McqStepConfig, answer: McqAnswer): GradeResult {
  const selectedOption = config.options.find((o) => o.id === answer.selectedOptionId);
  const correctOption = config.options.find((o) => o.isCorrect);

  if (!selectedOption) {
    return {
      score: 0,
      passed: false,
      feedback: 'No answer selected',
    };
  }

  const isCorrect = selectedOption.isCorrect;
  const score = isCorrect ? 1 : 0;

  // Map difficulty to confidence weight
  const confidenceByDifficulty = {
    beginner: 0.6,
    intermediate: 0.75,
    advanced: 0.9,
  };

  // Build skill scores
  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  return {
    score,
    passed: isCorrect,
    feedback: isCorrect
      ? 'Correct!'
      : `Incorrect. The correct answer was: "${correctOption?.text}". ${config.explanation || ''}`,
    skillScores,
    confidence: confidenceByDifficulty[config.difficulty],
    details: {
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: correctOption?.id,
      explanation: config.explanation,
    },
  };
}

// ============================================
// MICRO MCQ BURST GRADING
// ============================================

/**
 * Grade micro MCQ burst (3 rapid-fire questions)
 * Returns skill level based on number of correct answers
 */
export function gradeMicroMcqBurst(
  config: MicroMcqBurstStepConfig,
  answer: MicroMcqBurstAnswer
): GradeResult {
  const { answers } = answer;
  let correctCount = 0;
  const questionResults: Array<{ questionId: string; correct: boolean; explanation?: string }> = [];

  // Grade each question
  for (const question of config.questions) {
    const selectedOptionId = answers[question.id];
    const selectedOption = question.options.find((o) => o.id === selectedOptionId);
    const isCorrect = selectedOption?.isCorrect || false;

    if (isCorrect) {
      correctCount++;
    }

    questionResults.push({
      questionId: question.id,
      correct: isCorrect,
      explanation: question.explanation,
    });
  }

  // Calculate normalized score (0-1)
  const totalQuestions = config.questions.length;
  const score = correctCount / totalQuestions;

  // Determine detected level based on correct count
  let detectedLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (correctCount >= config.levelMapping.advanced) {
    detectedLevel = 'advanced';
  } else if (correctCount >= config.levelMapping.intermediate) {
    detectedLevel = 'intermediate';
  }

  // Build skill scores
  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  // Generate feedback
  let feedback = '';
  if (correctCount === totalQuestions) {
    feedback = `Excellent! You got all ${totalQuestions} questions correct. You seem to have a strong foundation.`;
  } else if (correctCount >= totalQuestions - 1) {
    feedback = `Good job! You got ${correctCount}/${totalQuestions} correct. You have a solid understanding.`;
  } else if (correctCount > 0) {
    feedback = `You got ${correctCount}/${totalQuestions} correct. Let's build on your existing knowledge.`;
  } else {
    feedback = `No worries! This assessment will help us find the right starting point for you.`;
  }

  return {
    score,
    passed: true, // Skill probe always passes - it's just for calibration
    feedback,
    skillScores,
    confidence: 0.8, // High confidence for MCQs
    details: {
      correctCount,
      totalQuestions,
      detectedLevel,
      questionResults,
    },
  };
}

// ============================================
// SHORT TEXT GRADING (AI)
// ============================================

/**
 * Grade short text answer using AI
 */
export async function gradeShortText(
  config: ShortTextStepConfig,
  answer: ShortTextAnswer
): Promise<GradeResult> {
  const { text } = answer;

  // Basic validation
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      passed: false,
      feedback: 'No answer provided',
    };
  }

  if (config.minLength && text.length < config.minLength) {
    return {
      score: 0.1,
      passed: false,
      feedback: `Answer is too short. Please provide at least ${config.minLength} characters.`,
    };
  }

  // Use AI grading if available
  if (ANTHROPIC_API_KEY) {
    try {
      const aiResult = await gradeWithAI(
        config.question,
        text,
        config.rubric,
        config.maxScore
      );

      // Build skill scores
      const skillScores: Record<string, number> = {};
      for (const skillKey of config.skillKeys) {
        skillScores[skillKey] = aiResult.normalizedScore;
      }

      return {
        score: aiResult.normalizedScore,
        passed: aiResult.normalizedScore >= 0.5,
        feedback: aiResult.feedback,
        skillScores,
        confidence: 0.7,
        details: {
          rubricScore: aiResult.rubricScore,
          maxScore: config.maxScore,
        },
      };
    } catch (error) {
      logger.error('AI grading failed, using fallback', error);
    }
  }

  // Fallback: basic heuristic grading
  return gradeShortTextFallback(config, text);
}

/**
 * Fallback grading when AI is unavailable
 */
function gradeShortTextFallback(config: ShortTextStepConfig, text: string): GradeResult {
  // Simple heuristics based on length and keywords
  const wordCount = text.split(/\s+/).length;
  const hasSubstance = wordCount >= 20;
  const hasTechnicalTerms = /function|callback|async|array|object|variable|loop/i.test(text);

  let score = 0.3; // Base score for attempting
  if (hasSubstance) score += 0.3;
  if (hasTechnicalTerms) score += 0.2;

  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  return {
    score,
    passed: score >= 0.5,
    feedback: 'Your answer has been recorded. (AI grading unavailable)',
    skillScores,
    confidence: 0.3, // Low confidence for heuristic grading
  };
}

/**
 * Grade text using Anthropic AI
 */
async function gradeWithAI(
  question: string,
  answer: string,
  rubric: string,
  maxScore: number
): Promise<{ rubricScore: number; normalizedScore: number; feedback: string }> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  const systemPrompt = `You are an expert grader for a coding assessment. Grade the student's answer according to the rubric provided.

Respond in JSON format ONLY with this structure:
{
  "score": <number between 0 and ${maxScore}>,
  "feedback": "<brief constructive feedback, 1-2 sentences>"
}`;

  const userPrompt = `Question: ${question}

Student's Answer: ${answer}

Rubric:
${rubric}

Grade this answer and provide brief feedback.`;

  const response = await anthropic.messages.create({
    model: AI_GRADER_MODEL,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.3,
    max_tokens: 300,
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI grading response');
  }

  const result = JSON.parse(jsonMatch[0]);
  const rubricScore = Math.min(Math.max(0, result.score), maxScore);
  const normalizedScore = rubricScore / maxScore;

  return {
    rubricScore,
    normalizedScore,
    feedback: result.feedback || 'No feedback provided',
  };
}

// ============================================
// CODE GRADING
// ============================================

/**
 * Grade code submission
 */
export async function gradeCode(config: CodeStepConfig, answer: CodeAnswer): Promise<GradeResult> {
  const { code } = answer;

  if (!code || code.trim().length === 0) {
    return {
      score: 0,
      passed: false,
      feedback: 'No code submitted',
    };
  }

  // Build test cases for evaluation
  const testCases = config.testCases.map((tc, i) => ({
    id: `test_${i}`,
    challengeId: config.id,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    isHidden: tc.isHidden,
    weight: 1,
    createdAt: new Date(),
  }));

  try {
    // Use existing code runner
    const result = await evaluateSubmission(code, config.language, testCases);

    // Calculate base score from test results
    const baseScore = result.score / 100;

    // Optional: AI code quality evaluation
    let qualityBonus = 0;
    let qualityFeedback = '';

    if (ANTHROPIC_API_KEY && result.passed) {
      try {
        const qualityResult = await evaluateCodeQuality(code, config.problemDescription);
        qualityBonus = qualityResult.bonus;
        qualityFeedback = qualityResult.feedback;
      } catch (error) {
        logger.warn('Code quality evaluation failed', { error: String(error) });
      }
    }

    // Final score (capped at 1.0)
    const finalScore = Math.min(1, baseScore + qualityBonus * 0.1);

    // Build skill scores
    const skillScores: Record<string, number> = {};
    for (const skillKey of config.skillKeys) {
      skillScores[skillKey] = finalScore;
    }

    const passedCount = result.results.filter((r) => r.passed).length;
    const totalCount = result.results.length;

    return {
      score: finalScore,
      passed: result.passed,
      feedback: result.passed
        ? `All ${totalCount} tests passed! ${qualityFeedback}`
        : `${passedCount}/${totalCount} tests passed. Check your logic and try again.`,
      skillScores,
      confidence: 0.9, // High confidence for automated testing
      details: {
        testResults: result.results.filter((r) => !config.testCases[parseInt(r.testCaseId.split('_')[1])]?.isHidden),
        passedCount,
        totalCount,
        qualityBonus,
      },
    };
  } catch (error) {
    logger.error('Code evaluation failed', error);
    return {
      score: 0,
      passed: false,
      feedback: 'Code evaluation failed. Please check your syntax and try again.',
    };
  }
}

/**
 * Evaluate code quality using AI
 */
async function evaluateCodeQuality(
  code: string,
  problemDescription: string
): Promise<{ bonus: number; feedback: string }> {
  if (!anthropic) {
    return { bonus: 0, feedback: '' };
  }

  const systemPrompt = `You are a code reviewer. Evaluate the code quality on these criteria:
- Clarity and readability
- Appropriate naming
- Efficient approach (not over-engineered, not overly complex)
- Idiomatic JavaScript usage

Respond in JSON format ONLY:
{
  "qualityScore": <number 0-3, where 3 is excellent>,
  "feedback": "<brief positive note about code quality, max 1 sentence>"
}`;

  const userPrompt = `Problem: ${problemDescription}

Code:
\`\`\`javascript
${code}
\`\`\`

Evaluate the code quality.`;

  const response = await anthropic.messages.create({
    model: AI_GRADER_MODEL,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return { bonus: 0, feedback: '' };
  }

  const result = JSON.parse(jsonMatch[0]);
  const qualityScore = Math.min(3, Math.max(0, result.qualityScore || 0));

  return {
    bonus: qualityScore / 3, // 0-1 bonus
    feedback: result.feedback || '',
  };
}

// ============================================
// DESIGN GRADING
// ============================================

/**
 * Grade design comparison answer
 */
export function gradeDesignComparison(
  config: DesignComparisonStepConfig,
  answer: DesignComparisonAnswer
): GradeResult {
  const isCorrect = answer.selectedOption === config.correctOption;
  const score = isCorrect ? 1 : 0;

  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  return {
    score,
    passed: isCorrect,
    feedback: isCorrect
      ? `Correct! ${config.explanation}`
      : `Not quite. ${config.explanation}`,
    skillScores,
    confidence: 0.7,
    details: {
      selectedOption: answer.selectedOption,
      correctOption: config.correctOption,
    },
  };
}

/**
 * Grade design critique using AI
 */
export async function gradeDesignCritique(
  config: DesignCritiqueStepConfig,
  answer: DesignCritiqueAnswer
): Promise<GradeResult> {
  const { critique } = answer;

  if (!critique || critique.trim().length === 0) {
    return {
      score: 0,
      passed: false,
      feedback: 'No critique provided',
    };
  }

  // Use AI grading if available
  if (ANTHROPIC_API_KEY) {
    try {
      const aiResult = await gradeDesignCritiqueWithAI(
        config.prompt,
        config.designDescription,
        critique,
        config.rubric,
        config.lookingFor
      );

      const skillScores: Record<string, number> = {};
      for (const skillKey of config.skillKeys) {
        skillScores[skillKey] = aiResult.normalizedScore;
      }

      return {
        score: aiResult.normalizedScore,
        passed: aiResult.normalizedScore >= 0.5,
        feedback: aiResult.feedback,
        skillScores,
        confidence: 0.7,
        details: {
          rubricScore: aiResult.rubricScore,
          identifiedPoints: aiResult.identifiedPoints,
        },
      };
    } catch (error) {
      logger.error('AI design critique grading failed', error);
    }
  }

  // Fallback grading
  return gradeDesignCritiqueFallback(config, critique);
}

/**
 * Grade design critique using AI
 */
async function gradeDesignCritiqueWithAI(
  prompt: string,
  designDescription: string,
  critique: string,
  rubric: string,
  lookingFor: string[]
): Promise<{
  rubricScore: number;
  normalizedScore: number;
  feedback: string;
  identifiedPoints: string[];
}> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  const systemPrompt = `You are grading a design critique. The student is evaluating a UI design and suggesting improvements.

Key points we're looking for:
${lookingFor.map((p) => `- ${p}`).join('\n')}

Rubric:
${rubric}

Respond in JSON format ONLY:
{
  "score": <number 0-3>,
  "identifiedPoints": [<list of key points the student correctly identified>],
  "feedback": "<brief constructive feedback>"
}`;

  const userPrompt = `Prompt given to student: ${prompt}

Design being critiqued: ${designDescription}

Student's critique:
${critique}

Grade this design critique.`;

  const response = await anthropic.messages.create({
    model: AI_GRADER_MODEL,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.3,
    max_tokens: 400,
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const result = JSON.parse(jsonMatch[0]);
  const rubricScore = Math.min(3, Math.max(0, result.score || 0));

  return {
    rubricScore,
    normalizedScore: rubricScore / 3,
    feedback: result.feedback || '',
    identifiedPoints: result.identifiedPoints || [],
  };
}

/**
 * Fallback grading for design critique
 */
function gradeDesignCritiqueFallback(
  config: DesignCritiqueStepConfig,
  critique: string
): GradeResult {
  // Simple keyword matching
  const lowerCritique = critique.toLowerCase();
  const keywords = [
    'color', 'contrast', 'spacing', 'alignment', 'font', 'typography',
    'hierarchy', 'layout', 'padding', 'margin', 'readable', 'accessibility',
    'inconsistent', 'cluttered', 'improve',
  ];

  const matchedKeywords = keywords.filter((k) => lowerCritique.includes(k));
  const wordCount = critique.split(/\s+/).length;

  let score = 0.2; // Base score
  if (wordCount >= 30) score += 0.2;
  if (matchedKeywords.length >= 2) score += 0.2;
  if (matchedKeywords.length >= 4) score += 0.2;

  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  return {
    score,
    passed: score >= 0.5,
    feedback: 'Your critique has been recorded. (AI grading unavailable)',
    skillScores,
      confidence: 0.3,
    };
}

// ============================================
// CODE REVIEW GRADING
// ============================================

/**
 * Grade code review
 */
export async function gradeCodeReview(
  config: CodeReviewStepConfig,
  answer: CodeReviewAnswer
): Promise<GradeResult> {
  const { critique } = answer;

  if (!critique || critique.trim().length === 0) {
    return {
      score: 0,
      passed: false,
      feedback: 'No review provided',
    };
  }

  // Fallback / Heuristic Grading (Mocking AI for now)
  // Check for overlap with "lookingFor" points
  const lowerCritique = critique.toLowerCase();
  
  // Naive checking against lookingFor array
  let matches = 0;
  // We assume lookingFor items are sentences, so we check for key words inside them? 
  // For this simple heuristic, let's look for specific keywords we know are in the specific prompt
  // OR just check if the lookingFor items are somewhat present.
  
  // Specific Logic for the "React Component" step we created:
  const keyTerms = ['dependency', 'array', 'loop', 'effect', 'dom', 'document', 'onclick', 'camelcase', 'json', 'parse'];
  const matchedTerms = keyTerms.filter(t => lowerCritique.includes(t));
  
  let score = 0.2;
  if (critique.length > 50) score += 0.2;
  if (matchedTerms.length >= 1) score += 0.2; 
  if (matchedTerms.length >= 3) score += 0.2;
  if (matchedTerms.length >= 5) score += 0.2; // Cap at 1.0

  const skillScores: Record<string, number> = {};
  for (const skillKey of config.skillKeys) {
    skillScores[skillKey] = score;
  }

  return {
    score: Math.min(1, score),
    passed: score >= 0.6,
    feedback: score >= 0.6 ? 'Good catch on those issues!' : 'You missed some critical bugs.',
    skillScores,
    confidence: 0.4,
    details: {
       matchedTerms
    }
  };
}

