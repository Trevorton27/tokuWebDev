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
import type { IntakeStepConfig } from '@/server/assessment/intakeConfig';

// Step Components
import QuestionnaireStep from '@/modules/assessment/ui/intake/QuestionnaireStep';
import McqStep from '@/modules/assessment/ui/intake/McqStep';
import ShortTextStep from '@/modules/assessment/ui/intake/ShortTextStep';
import CodeStep from '@/modules/assessment/ui/intake/CodeStep';
import DesignComparisonStep from '@/modules/assessment/ui/intake/DesignComparisonStep';
import DesignCritiqueStep from '@/modules/assessment/ui/intake/DesignCritiqueStep';
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

    const commonProps = {
      config: currentStep,
      onSubmit: handleSubmit,
      previousAnswer,
      isSubmitting: state === 'submitting',
    };

    switch (currentStep.kind) {
      case 'QUESTIONNAIRE':
        return <QuestionnaireStep {...commonProps} />;
      case 'MCQ':
        return <McqStep {...commonProps} lastResult={lastResult} />;
      case 'SHORT_TEXT':
        return <ShortTextStep {...commonProps} lastResult={lastResult} />;
      case 'CODE':
        return <CodeStep {...commonProps} />;
      case 'DESIGN_COMPARISON':
        return <DesignComparisonStep {...commonProps} lastResult={lastResult} />;
      case 'DESIGN_CRITIQUE':
        return <DesignCritiqueStep {...commonProps} />;
      case 'SUMMARY':
        return <SummaryStep sessionId={sessionId!} onComplete={() => router.push('/student')} />;
      default:
        return <div>Unknown step type</div>;
    }
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <SummaryStep sessionId={sessionId!} onComplete={() => router.push('/student')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              Skill Assessment
            </h1>
            <span className="text-sm text-gray-500">
              ~{estimatedMinutes} min total
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{progress}% complete</span>
            <span className="text-xs text-gray-500">
              {currentStep?.title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep?.kind !== 'SUMMARY' && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              disabled={!canGoBack || state === 'submitting'}
              className={`px-4 py-2 rounded-lg font-medium ${
                canGoBack && state !== 'submitting'
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500">
              Step {Math.round((progress / 100) * totalSteps)} of {totalSteps}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
