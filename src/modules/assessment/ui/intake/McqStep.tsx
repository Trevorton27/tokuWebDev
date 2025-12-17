'use client';

import { useState, useEffect } from 'react';
import type { McqStepConfig } from '@/server/assessment/intakeConfig';
import type { SubmitAnswerResponse } from '@/lib/intakeClient';

interface Props {
  config: McqStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
  lastResult?: SubmitAnswerResponse | null;
}

export default function McqStep({ config, onSubmit, previousAnswer, isSubmitting, lastResult }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    previousAnswer?.selectedOption || null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (previousAnswer?.selectedOption) {
      setSelectedOption(previousAnswer.selectedOption);
    }
  }, [previousAnswer]);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit({ selectedOption });
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadge(config.difficulty)}`}>
            {config.difficulty}
          </span>
        </div>
        <p className="text-gray-600">{config.description}</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {config.question}
          </pre>
        </div>

        <div className="space-y-3">
          {config.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedOption === option.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedOption === option.id
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOption === option.id && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-gray-800">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showExplanation && config.explanation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-800 text-sm">{config.explanation}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showExplanation ? 'Hide hint' : 'Need a hint?'}
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium ${
            selectedOption && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
