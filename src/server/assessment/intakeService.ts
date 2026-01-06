/**
 * Intake Assessment Service
 *
 * Manages assessment sessions, step progression, and answer submission.
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import {
  getFirstStep,
  getStepById,
  getNextStep,
  isLastStep,
  getStepProgress,
  getOrderedSteps,
  type IntakeStepConfig,
} from './intakeConfig';
import {
  gradeStep,
  type GradeResult,
} from './intakeGrader';
import {
  updateMultipleSkillMasteries,
  getProfileSummary,
  type MasteryUpdate,
} from './skillProfileService';
import { extractAndSaveStudentProfile } from './profileExtraction';

// ============================================
// TYPES
// ============================================

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface AssessmentSessionData {
  id: string;
  userId: string;
  sessionType: string;
  status: SessionStatus;
  currentStep: string | null;
  startedAt: Date;
  completedAt: Date | null;
  metadata: Record<string, any> | null;
}

export interface StartSessionResult {
  sessionId: string;
  firstStep: IntakeStepConfig;
  totalSteps: number;
  estimatedMinutes: number;
  isResuming: boolean;
}

export interface CurrentStepResult {
  step: IntakeStepConfig;
  progress: number; // 0-100
  previousAnswer?: any; // If they already answered this step
  canGoBack: boolean;
}

export interface SubmitAnswerResult {
  gradeResult: GradeResult;
  skillUpdates: Array<{
    skillKey: string;
    delta: number;
  }>;
  nextStep: IntakeStepConfig | null;
  isComplete: boolean;
  progress: number;
}

export interface SessionSummary {
  sessionId: string;
  completedAt: Date;
  totalSteps: number;
  profileSummary: Awaited<ReturnType<typeof getProfileSummary>>;
  stepResults: Array<{
    stepId: string;
    stepTitle: string;
    gradeResult: GradeResult | null;
  }>;
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Start or resume an assessment session
 */
export async function startAssessmentSession(
  userId: string,
  sessionType: string = 'INTAKE'
): Promise<StartSessionResult> {
  try {
    // Check for existing in-progress session
    const existingSession = await prisma.assessmentSession.findFirst({
      where: {
        userId,
        sessionType,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });

    const orderedSteps = getOrderedSteps();
    const totalSteps = orderedSteps.length;
    const estimatedMinutes = orderedSteps.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    if (existingSession) {
      // Resume existing session
      const currentStep = existingSession.currentStep
        ? getStepById(existingSession.currentStep)
        : getFirstStep();

      logger.info('Resuming assessment session', {
        sessionId: existingSession.id,
        userId,
        currentStep: currentStep?.id,
      });

      return {
        sessionId: existingSession.id,
        firstStep: currentStep || getFirstStep(),
        totalSteps,
        estimatedMinutes,
        isResuming: true,
      };
    }

    // Create new session
    const firstStep = getFirstStep();
    const newSession = await prisma.assessmentSession.create({
      data: {
        userId,
        sessionType,
        status: 'IN_PROGRESS',
        currentStep: firstStep.id,
      },
    });

    logger.info('Created new assessment session', {
      sessionId: newSession.id,
      userId,
      sessionType,
    });

    return {
      sessionId: newSession.id,
      firstStep,
      totalSteps,
      estimatedMinutes,
      isResuming: false,
    };
  } catch (error) {
    logger.error('Failed to start assessment session', error, { userId, sessionType });
    throw new Error('Failed to start assessment session');
  }
}

/**
 * Get the current step for a session
 */
export async function getCurrentStep(sessionId: string): Promise<CurrentStepResult | null> {
  try {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!session) {
      logger.warn('Session not found', { sessionId });
      return null;
    }

    if (session.status === 'COMPLETED') {
      // Return summary step if completed
      const summaryStep = getStepById('summary');
      if (summaryStep) {
        return {
          step: summaryStep,
          progress: 100,
          canGoBack: false,
        };
      }
    }

    const currentStepId = session.currentStep;
    if (!currentStepId) {
      return null;
    }

    const step = getStepById(currentStepId);
    if (!step) {
      logger.error('Step config not found', { stepId: currentStepId });
      return null;
    }

    // Check if they already answered this step
    const previousResponse = session.responses.find((r) => r.stepId === currentStepId);
    const previousAnswer = previousResponse?.rawAnswer;

    // Can go back if not on first step
    const orderedSteps = getOrderedSteps();
    const currentIndex = orderedSteps.findIndex((s) => s.id === currentStepId);
    const canGoBack = currentIndex > 0;

    return {
      step,
      progress: getStepProgress(currentStepId),
      previousAnswer: previousAnswer as any,
      canGoBack,
    };
  } catch (error) {
    logger.error('Failed to get current step', error, { sessionId });
    throw new Error('Failed to get current step');
  }
}

/**
 * Submit an answer for a step
 */
export async function submitStepAnswer(
  sessionId: string,
  stepId: string,
  answer: any
): Promise<SubmitAnswerResult> {
  try {
    // Get session
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'COMPLETED') {
      throw new Error('Session already completed');
    }

    // Get step config
    const stepConfig = getStepById(stepId);
    if (!stepConfig) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // Grade the answer
    const gradeResult = await gradeStep(stepConfig, answer, session.userId);

    // Calculate skill updates
    const masteryUpdates: MasteryUpdate[] = [];
    if (gradeResult.skillScores) {
      for (const [skillKey, score] of Object.entries(gradeResult.skillScores)) {
        masteryUpdates.push({
          skillKey,
          score,
          weight: gradeResult.confidence || 0.8,
          source: `intake_${stepConfig.kind.toLowerCase()}`,
        });
      }
    }

    // Update skill masteries
    const updateResults = masteryUpdates.length > 0
      ? await updateMultipleSkillMasteries(session.userId, masteryUpdates)
      : [];

    // Save response to database
    await prisma.assessmentResponse.upsert({
      where: {
        sessionId_stepId: {
          sessionId,
          stepId,
        },
      },
      create: {
        sessionId,
        stepId,
        stepKind: stepConfig.kind,
        rawAnswer: answer,
        gradeResult: gradeResult as any,
        skillUpdates: updateResults as any,
      },
      update: {
        rawAnswer: answer,
        gradeResult: gradeResult as any,
        skillUpdates: updateResults as any,
      },
    });

    // Determine next step with ADAPTIVE LOGIC
    let nextStep = getNextStep(stepId);
    
    // Check if next step should be skipped
    if (nextStep && nextStep.skipRules) {
        const { dependsOnStepId, condition, value } = nextStep.skipRules;
        
        // Find result of the dependency step
        const dependencyResponse = await prisma.assessmentResponse.findUnique({
            where: {
                sessionId_stepId: {
                    sessionId,
                    stepId: dependsOnStepId
                }
            }
        });

        if (dependencyResponse && dependencyResponse.gradeResult) {
            const grade = dependencyResponse.gradeResult as any;
            let shouldSkip = false;

            if (condition === 'CORRECT' && grade.passed) {
                shouldSkip = true;
            } else if (condition === 'SCORE_GT' && value !== undefined) {
                // Assuming score is normalized 0-1 or raw count. 
                // For MicroMcq, we might store 'correctCount' in details or just use score.
                // Let's assume score is 0-1 for now.
                if (grade.score >= value) shouldSkip = true;
                
                // Special case for MicroMcq raw count if stored in details
                if (grade.details && typeof grade.details.correctCount === 'number') {
                     if (grade.details.correctCount >= value) shouldSkip = true;
                }
            }

            if (shouldSkip) {
                logger.info(`Skipping step ${nextStep.id} due to adaptive logic (Dependency: ${dependsOnStepId})`);
                // Auto-pass the skipped step? Or just skip it?
                // For now, just skip to the one after it effectively by calling getNextStep again recursively or loop
                // but getNextStep only gets the immediate next. 
                // Simple hack: Just get the next of the next.
                const stepAfterSkip = getNextStep(nextStep.id);
                if (stepAfterSkip) {
                    nextStep = stepAfterSkip;
                }
            }
        }
    }

    const isComplete = isLastStep(stepId) || nextStep?.kind === 'SUMMARY';

    // Update session
    if (isComplete) {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          currentStep: 'summary',
          completedAt: new Date(),
        },
      });

      // Extract and save student profile (goals, interests) for project recommendations
      // This runs asynchronously and doesn't block assessment completion
      extractAndSaveStudentProfile(session.userId, sessionId).catch((err) => {
        logger.error('Failed to extract student profile (non-blocking)', err, {
          userId: session.userId,
          sessionId,
        });
      });
    } else if (nextStep) {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          currentStep: nextStep.id,
        },
      });
    }

    logger.info('Step answer submitted', {
      sessionId,
      stepId,
      stepKind: stepConfig.kind,
      score: gradeResult.score,
      isComplete,
    });

    return {
      gradeResult,
      skillUpdates: updateResults.map((u) => ({
        skillKey: u.skillKey,
        delta: u.delta,
      })),
      nextStep: isComplete ? null : nextStep,
      isComplete,
      progress: nextStep ? getStepProgress(nextStep.id) : 100,
    };
  } catch (error) {
    logger.error('Failed to submit step answer', error, { sessionId, stepId });
    throw error;
  }
}

/**
 * Go back to a previous step
 */
export async function goToPreviousStep(sessionId: string): Promise<CurrentStepResult | null> {
  try {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.currentStep) {
      return null;
    }

    const orderedSteps = getOrderedSteps();
    const currentIndex = orderedSteps.findIndex((s) => s.id === session.currentStep);

    if (currentIndex <= 0) {
      return null; // Already at first step
    }

    const previousStep = orderedSteps[currentIndex - 1];

    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        currentStep: previousStep.id,
      },
    });

    return getCurrentStep(sessionId);
  } catch (error) {
    logger.error('Failed to go to previous step', error, { sessionId });
    throw new Error('Failed to go to previous step');
  }
}

/**
 * Get session summary after completion
 */
export async function getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
  try {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          orderBy: { submittedAt: 'asc' },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Get profile summary
    const profileSummary = await getProfileSummary(session.userId);

    // Build step results
    const stepResults = session.responses.map((response) => {
      const stepConfig = getStepById(response.stepId);
      return {
        stepId: response.stepId,
        stepTitle: stepConfig?.title || response.stepId,
        gradeResult: response.gradeResult as GradeResult | null,
      };
    });

    return {
      sessionId,
      completedAt: session.completedAt || new Date(),
      totalSteps: getOrderedSteps().length,
      profileSummary,
      stepResults,
    };
  } catch (error) {
    logger.error('Failed to get session summary', error, { sessionId });
    throw new Error('Failed to get session summary');
  }
}

/**
 * Abandon a session
 */
export async function abandonSession(sessionId: string): Promise<void> {
  try {
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'ABANDONED',
      },
    });

    logger.info('Session abandoned', { sessionId });
  } catch (error) {
    logger.error('Failed to abandon session', error, { sessionId });
    throw new Error('Failed to abandon session');
  }
}

/**
 * Check if user has completed an intake assessment
 */
export async function hasCompletedIntake(userId: string): Promise<boolean> {
  try {
    const completedSession = await prisma.assessmentSession.findFirst({
      where: {
        userId,
        sessionType: 'INTAKE',
        status: 'COMPLETED',
      },
    });

    return !!completedSession;
  } catch (error) {
    logger.error('Failed to check intake completion', error, { userId });
    return false;
  }
}

/**
 * Get user's most recent intake session (completed or in-progress)
 */
export async function getLatestIntakeSession(
  userId: string
): Promise<AssessmentSessionData | null> {
  try {
    const session = await prisma.assessmentSession.findFirst({
      where: {
        userId,
        sessionType: 'INTAKE',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) return null;

    return {
      id: session.id,
      userId: session.userId,
      sessionType: session.sessionType,
      status: session.status as SessionStatus,
      currentStep: session.currentStep,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      metadata: session.metadata as Record<string, any> | null,
    };
  } catch (error) {
    logger.error('Failed to get latest intake session', error, { userId });
    return null;
  }
}
