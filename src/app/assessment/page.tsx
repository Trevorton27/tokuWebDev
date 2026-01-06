'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  startIntakeSession,
  getCurrentStep,
  submitStepAnswer,
  goBack,
  type StartSessionResponse,
  type CurrentStepResponse,
  type SubmitAnswerResponse,
} from '@/lib/intakeClient';
import type {
  IntakeStepConfig,
  QuestionnaireStepConfig,
  McqStepConfig,
  MicroMcqBurstStepConfig,
  ShortTextStepConfig,
  CodeStepConfig,
  DesignComparisonStepConfig,
  DesignCritiqueStepConfig,
  CodeReviewStepConfig,
} from '@/server/assessment/intakeConfig';

// Step Components
import QuestionnaireStep from '@/modules/assessment/ui/intake/QuestionnaireStep';
import McqStep from '@/modules/assessment/ui/intake/McqStep';
import MicroMcqBurstStep from '@/modules/assessment/ui/intake/MicroMcqBurstStep';
import ShortTextStep from '@/modules/assessment/ui/intake/ShortTextStep';
import CodeStep from '@/modules/assessment/ui/intake/CodeStep';
import DesignComparisonStep from '@/modules/assessment/ui/intake/DesignComparisonStep';
import DesignCritiqueStep from '@/modules/assessment/ui/intake/DesignCritiqueStep';
import CodeReviewStep from '@/modules/assessment/ui/intake/CodeReviewStep';
import SummaryStep from '@/modules/assessment/ui/intake/SummaryStep';

type WizardState = 'loading' | 'active' | 'submitting' | 'complete' | 'error';

export default function IntakeAssessmentPage() {
  const router = useRouter();
  const [state, setState] = useState<WizardState>('loading');
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<IntakeStepConfig | null>(null);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [previousAnswer, setPreviousAnswer] = useState<any>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  const [lastResult, setLastResult] = useState<SubmitAnswerResponse | null>(null);

  // Initialize session
  useEffect(() => {
    async function init() {
      try {
        const result = await startIntakeSession();
        setSessionId(result.sessionId);
        setCurrentStep(result.firstStep);
        setTotalSteps(result.totalSteps);
        setEstimatedMinutes(result.estimatedMinutes);
        setState('active');

        // Get current step details
        const stepResult = await getCurrentStep(result.sessionId);
        setProgress(stepResult.progress);
        setCanGoBack(stepResult.canGoBack);
        setPreviousAnswer(stepResult.previousAnswer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start assessment');
        setState('error');
      }
    }
    init();
  }, []);

  // Handle answer submission
  const handleSubmit = useCallback(async (answer: any) => {
    if (!sessionId || !currentStep) return;

    setState('submitting');
    setError(null);

    try {
      const result = await submitStepAnswer(sessionId, currentStep.id, answer);
      setLastResult(result);

      if (result.isComplete) {
        setState('complete');
      } else if (result.nextStep) {
        setCurrentStep(result.nextStep);
        setProgress(result.progress);
        setPreviousAnswer(null);

        // Get updated step details
        const stepResult = await getCurrentStep(sessionId);
        setCanGoBack(stepResult.canGoBack);
        setPreviousAnswer(stepResult.previousAnswer);
        setState('active');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setState('active');
    }
  }, [sessionId, currentStep]);

  // Handle going back
  const handleBack = useCallback(async () => {
    if (!sessionId || !canGoBack) return;

    try {
      const result = await goBack(sessionId);
      setCurrentStep(result.step);
      setProgress(result.progress);
      setCanGoBack(result.canGoBack);
      setPreviousAnswer(result.previousAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go back');
    }
  }, [sessionId, canGoBack]);

  // Render step based on kind
  const renderStep = () => {
    if (!currentStep) return null;

    const isSubmittingNow = state === 'submitting';

    switch (currentStep.kind) {
      case 'QUESTIONNAIRE':
        return (
          <QuestionnaireStep
            config={currentStep as QuestionnaireStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
          />
        );
      case 'MCQ':
        return (
          <McqStep
            config={currentStep as McqStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
            lastResult={lastResult}
          />
        );
      case 'MICRO_MCQ_BURST':
        return (
          <MicroMcqBurstStep
            config={currentStep as MicroMcqBurstStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
            lastResult={lastResult}
          />
        );
      case 'SHORT_TEXT':
        return (
          <ShortTextStep
            config={currentStep as ShortTextStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
            lastResult={lastResult}
          />
        );
      case 'CODE':
        return (
          <CodeStep
            config={currentStep as CodeStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
          />
        );
      case 'DESIGN_COMPARISON':
        return (
          <DesignComparisonStep
            config={currentStep as DesignComparisonStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
            lastResult={lastResult}
          />
        );
        return (
          <DesignCritiqueStep
            config={currentStep as DesignCritiqueStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
          />
        );
      case 'CODE_REVIEW':
        return (
          <CodeReviewStep
            config={currentStep as CodeReviewStepConfig}
            onSubmit={handleSubmit}
            previousAnswer={previousAnswer}
            isSubmitting={isSubmittingNow}
          />
        );
      case 'SUMMARY':
        return <SummaryStep sessionId={sessionId!} onComplete={() => router.push('/student')} />;
      default:
        return <div>Unknown step type</div>;
    }
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 max-w-md text-center border border-gray-200 dark:border-dark-border">
          <div className="text-red-500 dark:text-red-400 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Complete state
  if (state === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <SummaryStep sessionId={sessionId!} onComplete={() => router.push('/student')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Progress Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Skill Assessment
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ~{estimatedMinutes} min total
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-dark-card rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{progress}% complete</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentStep?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-dark-border">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep?.kind !== 'SUMMARY' && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              disabled={!canGoBack || state === 'submitting'}
              className={`px-4 py-2 rounded-lg font-medium transition ${canGoBack && state !== 'submitting'
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {Math.round((progress / 100) * totalSteps)} of {totalSteps}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
