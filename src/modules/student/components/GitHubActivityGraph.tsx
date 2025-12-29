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
      <div className="space-y-5">
        <div className="bg-slate-900/40 rounded-lg p-6 border border-slate-800/50 animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-1/3 mb-5"></div>
          <div className="h-48 bg-slate-800 rounded mb-4"></div>
          <div className="h-12 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    // Rate limit error - show detailed instructions
    if (error.type === 'RATE_LIMIT') {
      return (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl text-yellow-500">⚠️</span>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-100 mb-1.5">
                GitHub API Rate Limit Exceeded
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                {error.message}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-slate-200 mb-3">
              How to Fix This:
            </h4>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  GitHub Settings → Developer settings → Personal access tokens
                </a>
              </li>
              <li>Click "Generate new token" (classic)</li>
              <li>
                Give it a name like "Signal Works LMS" and select these scopes:
                <ul className="ml-6 mt-1 space-y-1 list-disc">
                  <li><code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">public_repo</code> - Read public repositories</li>
                  <li><code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">read:user</code> - Read user profile</li>
                </ul>
              </li>
              <li>Generate the token and copy it</li>
              <li>Go to the <strong className="text-slate-300">Webhook</strong> tab on this page</li>
              <li>Scroll to the "GitHub Personal Access Token" section</li>
              <li>Paste your token and click "Save Personal Access Token"</li>
            </ol>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded p-3 mb-4">
            <p className="text-xs text-slate-300">
              <strong>ℹ️ Why?</strong> Without a token, GitHub limits you to 60 requests/hour. With a token, you get 5,000 requests/hour.
            </p>
          </div>

          <button
            onClick={fetchActivity}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // Other errors - show simple error message
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-5">
        <p className="text-sm text-slate-300 mb-2">{error.message}</p>
        {error.type === 'AUTH_ERROR' && (
          <p className="text-xs text-slate-400 mb-4">
            There may be an issue with your GitHub authentication or permissions.
          </p>
        )}
        <button
          onClick={fetchActivity}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
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
    <div className="space-y-5">
      {/* Hero: Contribution Heatmap */}
      <div className="bg-slate-900/40 rounded-lg p-6 border border-slate-800/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-100">
            Contribution Activity
          </h3>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg bg-slate-800/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Heatmap Grid - 1.5x larger */}
        <div className="overflow-x-auto py-4">
          <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.ceil(data.contributions.length / 7)}, minmax(14px, 1fr))` }}>
            {data.contributions.map((day, idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-green-400 cursor-pointer transition-all`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-5 text-xs text-slate-500">
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

      {/* Summary Strip - Single Line */}
      <div className="bg-slate-900/40 rounded-lg px-5 py-4 border border-slate-800/50">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{data.summary.total}</span>
            <span className="text-slate-400">Total contributions</span>
          </div>
          <div className="text-slate-600">•</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{data.summary.activeDays}</span>
            <span className="text-slate-400">Active days</span>
          </div>
          <div className="text-slate-600">•</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{data.summary.maxInDay}</span>
            <span className="text-slate-400">Best day</span>
          </div>
          <div className="text-slate-600">•</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{data.summary.average}</span>
            <span className="text-slate-400">Avg/day</span>
          </div>
        </div>

        {/* Empty State Encouragement */}
        {data.summary.total < 5 && data.summary.total > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <p className="text-xs text-slate-500">
              First activity logged 🎉 Keep going—your streak starts here.
            </p>
          </div>
        )}
      </div>

      {/* GitHub Statistics - Flattened */}
      {data.statistics && (
        <div className="bg-slate-900/40 rounded-lg p-5 border border-slate-800/50">
          <h3 className="text-base font-medium text-slate-200 mb-4">
            GitHub Statistics
          </h3>

          {/* Stats Grid - Simple 3-column */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-6">
            <div>
              <div className="text-xl font-bold text-slate-200">
                {data.statistics.repositories}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Repositories
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-200 flex items-center gap-1">
                <span className="text-slate-500 text-base">⭐</span>
                {data.statistics.stars}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Stars
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-200">
                {data.statistics.forks}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Forks
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-200">
                {data.statistics.recentActivity}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Recent Events
              </div>
            </div>
          </div>

          {/* Top Languages */}
          {data.statistics?.topLanguages && data.statistics.topLanguages.length > 0 && (
            <div className="pt-4 border-t border-slate-800/50">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Top Languages
              </h4>
              <div className="space-y-2.5">
                {data.statistics.topLanguages.map((lang) => (
                  <div key={lang.language} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-300">
                          {lang.language}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lang.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
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
