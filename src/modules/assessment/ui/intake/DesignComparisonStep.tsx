'use client';

import { useState, useEffect } from 'react';
import type { DesignComparisonStepConfig } from '@/server/assessment/intakeConfig';
import type { SubmitAnswerResponse } from '@/lib/intakeClient';

interface Props {
  config: DesignComparisonStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
  lastResult?: SubmitAnswerResponse | null;
}

export default function DesignComparisonStep({ config, onSubmit, previousAnswer, isSubmitting, lastResult }: Props) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(
    previousAnswer?.selectedOption || null
  );

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

  const renderDesignOption = (option: typeof config.optionA, label: 'A' | 'B') => {
    const isSelected = selectedOption === label;

    return (
      <button
        type="button"
        onClick={() => setSelectedOption(label)}
        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`font-bold text-lg ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
            Option {label}
          </span>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {option.inlineHtml && (
          <div
            className="bg-white border border-gray-100 rounded-lg p-4 mb-3 flex items-center justify-center min-h-[100px]"
            dangerouslySetInnerHTML={{ __html: option.inlineHtml }}
          />
        )}

        {option.imageUrl && (
          <div className="mb-3">
            <img
              src={option.imageUrl}
              alt={`Design option ${label}`}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}

        <p className="text-sm text-gray-600 text-left">{option.description}</p>
      </button>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-800 font-medium">{config.prompt}</p>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          {renderDesignOption(config.optionA, 'A')}
          {renderDesignOption(config.optionB, 'B')}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-800 text-sm">
            Consider factors like visual hierarchy, readability, user experience, and design principles.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
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
