'use client';

import { useState } from 'react';
import assessmentClient from '@/lib/assessmentClient';
import type { Challenge, CodeExecutionResult } from '@/lib/types';
import TestResults from './TestResults';

interface ChallengeRunnerProps {
  challenge: Challenge;
}

export default function ChallengeRunner({ challenge }: ChallengeRunnerProps) {
  const [code, setCode] = useState(challenge.starterCode || '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);

    try {
      const executionResult = await assessmentClient.runCode({
        code,
        language: challenge.language,
        challengeId: challenge.id,
      });
      setResult(executionResult);
    } catch (err) {
      console.error('Failed to run code:', err);
      setResult({
        stdout: '',
        stderr: 'Failed to execute code',
        executionTime: 0,
        error: 'Execution failed',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
        <p className="text-gray-700 mb-4">{challenge.description}</p>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              challenge.difficulty === 'BEGINNER'
                ? 'bg-green-100 text-green-700'
                : challenge.difficulty === 'INTERMEDIATE'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {challenge.difficulty}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {challenge.language}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-gray-900">Your Code</label>
          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {running ? 'Running...' : 'Run Code'}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          spellCheck={false}
        />
      </div>

      {result && <TestResults result={result} />}
    </div>
  );
}
