'use client';

import type { CodeExecutionResult } from '@/lib/types';

interface TestResultsProps {
  result: CodeExecutionResult;
}

export default function TestResults({ result }: TestResultsProps) {
  const hasError = !!result.error || !!result.stderr;

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Execution Results</h3>

      {hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Error</h4>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">
            {result.stderr || result.error}
          </pre>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Output</h4>
          <pre className="text-sm text-green-700 whitespace-pre-wrap">
            {result.stdout || '(no output)'}
          </pre>
        </div>
      )}

      <div className="mt-3 text-sm text-gray-600">
        <p>Execution time: {result.executionTime.toFixed(2)}s</p>
        {result.memory && <p>Memory used: {(result.memory / 1024).toFixed(2)} MB</p>}
      </div>
    </div>
  );
}
