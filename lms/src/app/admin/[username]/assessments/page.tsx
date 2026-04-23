'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AssessmentSession {
  assessmentNumber: number;
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  responseCount: number;
  averageScore: number;
}

interface Student {
  id: string;
  email: string;
  name: string | null;
  username: string;
}

export default function AssessmentsListPage() {
  const params = useParams();
  const username = params.username as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, [username]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/${username}/assessments`);
      const data = await res.json();

      if (data.success) {
        setStudent(data.data.student);
        setSessions(data.data.sessions);
      } else {
        setError(data.error || 'Failed to load assessments');
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
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

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
      IN_PROGRESS: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
      ABANDONED: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300',
    };

    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          styles[status as keyof typeof styles] || styles.ABANDONED
        }`}
      >
        {status}
      </span>
    );
  };

  const getScoreBadge = (score: number) => {
    let colorClass = '';
    if (score >= 70) {
      colorClass = 'text-green-600 dark:text-green-400';
    } else if (score >= 50) {
      colorClass = 'text-yellow-600 dark:text-yellow-400';
    } else {
      colorClass = 'text-red-600 dark:text-red-400';
    }

    return <span className={`text-2xl font-bold ${colorClass}`}>{score}%</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Results</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Link
              href="/admin/students"
              className="inline-block px-6 py-3 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
            >
              Back to Students
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
                Assessment Results
              </h1>
              {student && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {student.name || username}
                </p>
              )}
            </div>
            <Link
              href="/admin/students"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Assessments Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This student has not completed any assessments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-dark-card shadow-md rounded-lg p-6 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Assessment #{session.assessmentNumber}
                      </h3>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Started:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDate(session.startedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {session.completedAt ? formatDate(session.completedAt) : 'In Progress'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Questions Answered:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {session.responseCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 text-center">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Score
                    </div>
                    {getScoreBadge(session.averageScore)}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <Link
                    href={`/admin/${username}/assessments/${session.assessmentNumber}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-purple-600 rounded-md hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Detailed Results
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
