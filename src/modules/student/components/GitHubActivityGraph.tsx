/**
 * GitHub Activity Graph Component
 * Visual contribution heatmap and statistics
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ActivityData {
  contributions: ContributionDay[];
  summary: {
    total: number;
    activeDays: number;
    maxInDay: number;
    average: number;
    period: string;
  };
  statistics?: {
    repositories: number;
    stars: number;
    forks: number;
    recentActivity: number;
    topLanguages: Array<{
      language: string;
      count: number;
      percentage: number;
    }>;
  };
}

interface ErrorState {
  message: string;
  type?: 'RATE_LIMIT' | 'AUTH_ERROR' | 'GENERAL';
  resetAt?: string;
}

export default function GitHubActivityGraph() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchActivity();
  }, [days]);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/github/activity?days=${days}&includeStats=true`
      );

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setError({
        message: errorData?.error || 'Failed to fetch activity data',
        type: errorData?.errorType || 'GENERAL',
        resetAt: errorData?.resetAt,
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-green-200 dark:bg-green-900';
      case 2:
        return 'bg-green-400 dark:bg-green-700';
      case 3:
        return 'bg-green-600 dark:bg-green-500';
      case 4:
        return 'bg-green-800 dark:bg-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Rate limit error - show detailed instructions
    if (error.type === 'RATE_LIMIT') {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                GitHub API Rate Limit Exceeded
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                {error.message}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📝 How to Fix This:
            </h4>
            <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  GitHub Settings → Developer settings → Personal access tokens
                </a>
              </li>
              <li>Click "Generate new token" (classic)</li>
              <li>
                Give it a name like "Signal Works LMS" and select these scopes:
                <ul className="ml-6 mt-1 space-y-1 list-disc">
                  <li><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">public_repo</code> - Read public repositories</li>
                  <li><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">read:user</code> - Read user profile</li>
                </ul>
              </li>
              <li>Generate the token and copy it</li>
              <li>Go to the <strong>Webhook</strong> tab on this page</li>
              <li>Scroll to the "GitHub Personal Access Token" section</li>
              <li>Paste your token and click "Save Personal Access Token"</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>ℹ️ Why?</strong> Without a token, GitHub limits you to 60 requests/hour. With a token, you get 5,000 requests/hour.
            </p>
          </div>

          <button
            onClick={fetchActivity}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // Other errors - show simple error message
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <p className="text-sm text-red-800 dark:text-red-200 mb-2">{error.message}</p>
        {error.type === 'AUTH_ERROR' && (
          <p className="text-xs text-red-700 dark:text-red-300 mb-4">
            There may be an issue with your GitHub authentication or permissions.
          </p>
        )}
        <button
          onClick={fetchActivity}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 border border-gray-100 dark:border-dark-border">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.summary.total}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total Contributions
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 border border-gray-100 dark:border-dark-border">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data.summary.activeDays}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Active Days
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 border border-gray-100 dark:border-dark-border">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {data.summary.maxInDay}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Best Day
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 border border-gray-100 dark:border-dark-border">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {data.summary.average}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Daily Average
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contribution Activity
          </h3>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.ceil(data.contributions.length / 7)}, minmax(12px, 1fr))` }}>
            {data.contributions.map((day, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* GitHub Statistics */}
      {data.statistics && (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            GitHub Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.statistics.repositories}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Repositories
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                ⭐ {data.statistics.stars}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Stars
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.statistics.forks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Forks
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.statistics.recentActivity}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Recent Events
              </div>
            </div>
          </div>

          {/* Top Languages */}
          {data.statistics?.topLanguages && data.statistics.topLanguages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Top Languages
              </h4>
              <div className="space-y-2">
                {data.statistics.topLanguages.map((lang) => (
                  <div key={lang.language} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lang.language}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {lang.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
