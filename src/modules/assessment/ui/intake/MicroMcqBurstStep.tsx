'use client';

import { useState, useEffect } from 'react';
import type { MicroMcqBurstStepConfig } from '@/server/assessment/intakeConfig';
import type { SubmitAnswerResponse } from '@/lib/intakeClient';

interface Props {
  config: MicroMcqBurstStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
  lastResult?: SubmitAnswerResponse | null;
}

export default function MicroMcqBurstStep({ config, onSubmit, previousAnswer, isSubmitting }: Props) {
  // Track selected option for each question
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (previousAnswer?.answers) {
      return previousAnswer.answers;
    }
    return {};
  });

  useEffect(() => {
    if (previousAnswer?.answers) {
      setAnswers(previousAnswer.answers);
    }
  }, [previousAnswer]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    // All questions must be answered
    if (Object.keys(answers).length === config.questions.length) {
      onSubmit({ answers });
    }
  };

  const allAnswered = Object.keys(answers).length === config.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
            Quick Check
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{config.description}</p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-800 dark:text-blue-300 text-sm">{config.instructions}</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {answeredCount} of {config.questions.length} answered
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round((answeredCount / config.questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-card rounded-full h-2">
          <div
            className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / config.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {config.questions.map((question, index) => (
          <div
            key={question.id}
            className={`p-5 rounded-lg border-2 transition-all ${
              answers[question.id]
                ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
            }`}
          >
            {/* Question number badge */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                answers[question.id]
                  ? 'bg-green-500 dark:bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-dark-hover text-gray-600 dark:text-gray-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  {question.question}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionSelect(question.id, option.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                        answers[question.id] === option.id
                          ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-dark-surface'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            answers[question.id] === option.id
                              ? 'border-purple-500 dark:border-purple-400 bg-purple-500 dark:bg-purple-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {answers[question.id] === option.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            allAnswered && !isSubmitting
              ? 'bg-purple-600 dark:bg-purple-600 text-white hover:bg-purple-700 dark:hover:bg-purple-700'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : allAnswered ? (
            'Continue →'
          ) : (
            `Answer all ${config.questions.length} questions`
          )}
        </button>
      </div>
    </div>
  );
}
