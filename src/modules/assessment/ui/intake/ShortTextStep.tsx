'use client';

import { useState, useEffect } from 'react';
import type { ShortTextStepConfig } from '@/server/assessment/intakeConfig';
import type { SubmitAnswerResponse } from '@/lib/intakeClient';

interface Props {
  config: ShortTextStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
  lastResult?: SubmitAnswerResponse | null;
}

export default function ShortTextStep({ config, onSubmit, previousAnswer, isSubmitting, lastResult }: Props) {
  const [answer, setAnswer] = useState(previousAnswer?.text || '');

  useEffect(() => {
    if (previousAnswer?.text) {
      setAnswer(previousAnswer.text);
    }
  }, [previousAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ text: answer });
  };

  const charCount = answer.length;
  const minLength = config.minLength || 0;
  const maxLength = config.maxLength || 1000;
  const isValid = charCount >= minLength && charCount <= maxLength;

  const getCharCountColor = () => {
    if (charCount < minLength) return 'text-red-500';
    if (charCount > maxLength * 0.9) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-800 font-medium">{config.question}</p>
        </div>

        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={config.placeholder || 'Type your answer here...'}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <div className={`absolute bottom-3 right-3 text-sm ${getCharCountColor()}`}>
            {charCount} / {maxLength}
            {minLength > 0 && charCount < minLength && (
              <span className="ml-2">(min: {minLength})</span>
            )}
          </div>
        </div>

        {charCount < minLength && charCount > 0 && (
          <p className="mt-2 text-sm text-red-500">
            Please write at least {minLength} characters ({minLength - charCount} more needed)
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-blue-800 text-sm font-medium">Tips for a good answer:</p>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
              <li>Be specific and use examples when possible</li>
              <li>Explain your reasoning, not just the facts</li>
              <li>Use proper terminology if you know it</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium ${
            isValid && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}
