'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface QuestionResult {
  stepId: string;
  stepKind: string;
  rawAnswer: any;
  gradeResult: {
    score: number;
    passed: boolean;
    feedback?: string;
    details?: any;
  };
}

interface SessionDetail {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  averageScore: number;
  student: {
    id: string;
    email: string;
    name: string | null;
    username: string;
  };
  responses: QuestionResult[];
}

export default function DetailedAssessmentResultsPage() {
  const params = useParams();
  const username = params.username as string;
  const assessmentNumber = params.assessmentNumber as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [username, assessmentNumber]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/${username}/assessments/${assessmentNumber}`);
      const data = await res.json();

      if (data.success) {
        setSession(data.data);
      } else {
        setError(data.error || 'Failed to load session details');
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStepKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      QUESTIONNAIRE: 'Questionnaire',
      MCQ: 'Multiple Choice',
      MICRO_MCQ_BURST: 'Quick Quiz',
      SHORT_TEXT: 'Short Answer',
      CODE: 'Coding Challenge',
      DESIGN_COMPARISON: 'Design Comparison',
      DESIGN_CRITIQUE: 'Design Critique',
      SUMMARY: 'Summary',
    };
    return labels[kind] || kind;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 dark:text-green-400';
    if (score >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderAnswer = (response: QuestionResult) => {
    const { stepKind, rawAnswer } = response;

    switch (stepKind) {
      case 'MCQ':
      case 'DESIGN_COMPARISON':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Selected: <span className="font-medium">{rawAnswer.selectedOption || rawAnswer.selectedOptionId}</span>
          </div>
        );

      case 'MICRO_MCQ_BURST':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="font-medium mb-1">Answers:</div>
            {Object.entries(rawAnswer.answers || {}).map(([key, value]) => (
              <div key={key} className="ml-4">
                {key}: {String(value)}
              </div>
            ))}
          </div>
        );

      case 'SHORT_TEXT':
      case 'DESIGN_CRITIQUE':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="font-medium mb-1">Response:</div>
            <div className="ml-4 p-3 bg-gray-50 dark:bg-dark-surface rounded border border-gray-200 dark:border-dark-border whitespace-pre-wrap">
              {rawAnswer.text || rawAnswer.critique || 'No response'}
            </div>
          </div>
        );

      case 'CODE':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="font-medium mb-1">Code:</div>
            <pre className="ml-4 p-3 bg-gray-900 dark:bg-black text-green-400 rounded overflow-x-auto text-xs">
              <code>{rawAnswer.code || 'No code submitted'}</code>
            </pre>
          </div>
        );

      case 'QUESTIONNAIRE':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div className="font-medium mb-1">Responses:</div>
            <div className="ml-4 space-y-1">
              {Object.entries(rawAnswer).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-500 dark:text-gray-400">{key}:</span>{' '}
                  <span className="font-medium">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Answer recorded
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading assessment details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Details</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link
              href={`/admin/${username}/assessments`}
              className="inline-block px-6 py-3 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
            >
              Back to Assessment List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow dark:shadow-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Assessment #{assessmentNumber} - Detailed Results
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {session.student.name || session.student.username}
              </p>
            </div>
            <Link
              href={`/admin/${username}/assessments`}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <div className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6 mb-6 border border-gray-200 dark:border-dark-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(session.averageScore / 100)}`}>
                {session.averageScore}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Started</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(session.startedAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
              </div>
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Question Responses ({session.responses.length})
          </h2>

          {session.responses.map((response, index) => (
            <div
              key={index}
              className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6 border border-gray-200 dark:border-dark-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Question {index + 1}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                      {getStepKindLabel(response.stepKind)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Step ID: {response.stepId}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(response.gradeResult?.score || 0)}`}>
                    {Math.round((response.gradeResult?.score || 0) * 100)}%
                  </div>
                  <div className="text-xs mt-1">
                    {response.gradeResult?.passed ? (
                      <span className="text-green-600 dark:text-green-400">✓ Passed</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">✗ Failed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="mb-4">
                <div className="font-medium text-gray-900 dark:text-white mb-2">Answer:</div>
                {renderAnswer(response)}
              </div>

              {/* Feedback */}
              {response.gradeResult?.feedback && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-900 dark:text-blue-300 mb-1">Feedback:</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    {response.gradeResult.feedback}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
