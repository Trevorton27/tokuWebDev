'use client';

import { useState, useEffect } from 'react';
import type { CodeStepConfig } from '@/server/assessment/intakeConfig';

interface Props {
  config: CodeStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
}

export default function CodeStep({ config, onSubmit, previousAnswer, isSubmitting }: Props) {
  const [code, setCode] = useState(previousAnswer?.code || config.starterCode);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    if (previousAnswer?.code) {
      setCode(previousAnswer.code);
    }
  }, [previousAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ code });
  };

  const handleReset = () => {
    setCode(config.starterCode);
  };

  const revealNextHint = () => {
    if (config.hints && currentHint < config.hints.length) {
      setShowHints(true);
      setCurrentHint((prev) => Math.min(prev + 1, config.hints?.length || 0));
    }
  };

  const visibleTestCases = config.testCases.filter((tc) => !tc.isHidden);
  const hasCode = code.trim() !== config.starterCode.trim();

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <pre className="text-gray-100 text-sm whitespace-pre-wrap font-mono">
            {config.problemDescription}
          </pre>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block font-medium text-gray-900">Your Solution</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {config.language}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Reset code
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 px-4 py-3 bg-gray-900 text-gray-100 font-mono text-sm border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            spellCheck={false}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-3">Test Cases</h3>
          <div className="space-y-2">
            {visibleTestCases.map((tc, index) => (
              <div key={index} className="flex items-start gap-4 text-sm">
                <div className="flex-1">
                  <span className="text-gray-500">Input:</span>
                  <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-gray-800">
                    {tc.input}
                  </code>
                </div>
                <div className="flex-1">
                  <span className="text-gray-500">Expected:</span>
                  <code className="ml-2 bg-green-100 px-2 py-1 rounded text-green-800">
                    {tc.expectedOutput}
                  </code>
                </div>
              </div>
            ))}
            {config.testCases.some((tc) => tc.isHidden) && (
              <p className="text-xs text-gray-500 italic mt-2">
                + {config.testCases.filter((tc) => tc.isHidden).length} hidden test cases
              </p>
            )}
          </div>
        </div>

        {config.hints && config.hints.length > 0 && (
          <div className="mb-4">
            {showHints && currentHint > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Hints ({currentHint}/{config.hints.length})
                </h4>
                <ul className="space-y-1">
                  {config.hints.slice(0, currentHint).map((hint, index) => (
                    <li key={index} className="text-yellow-700 text-sm flex items-start gap-2">
                      <span className="text-yellow-500">💡</span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {currentHint < config.hints.length && (
              <button
                type="button"
                onClick={revealNextHint}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {showHints ? 'Show next hint' : 'Need a hint?'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!hasCode || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium ${
            hasCode && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Running tests...' : 'Submit & Continue →'}
        </button>
      </div>
    </form>
  );
}
