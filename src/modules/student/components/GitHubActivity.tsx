'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatRelativeTime } from '@/lib/activityUtils';

interface GitHubData {
  username: string | null;
  repoUrl: string | null;
  recentEvents: Array<{
    eventType: string;
    action: string | null;
    repository: string;
    timestamp: string;
    commitCount?: number;
  }>;
  weeklyStats: {
    commits: number;
    prs: number;
    additions: number;
    deletions: number;
  };
}

export default function GitHubActivity() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGitHubActivity();
  }, []);

  const fetchGitHubActivity = async () => {
    try {
      const response = await axios.get('/api/activity/github');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub activity:', err);
      setError('Failed to load GitHub data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          GitHub Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'Unable to load GitHub data'}
        </p>
      </div>
    );
  }

  if (!data.username) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          GitHub Activity
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your GitHub account to track repository activity
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Contact your instructor to link your GitHub username
          </p>
        </div>
      </div>
    );
  }

  const formatEventType = (type: string) => {
    switch (type) {
      case 'push':
        return 'Pushed commits';
      case 'pull_request':
        return 'Pull request';
      default:
        return type;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'push':
        return '📤';
      case 'pull_request':
        return '🔀';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          GitHub Activity
        </h2>
        <a
          href={data.repoUrl || `https://github.com/${data.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View on GitHub →
        </a>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.weeklyStats.commits}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Commits (7d)
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.weeklyStats.prs}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Pull Requests
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Recent Activity
        </h3>
        {data.recentEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        ) : (
          data.recentEvents.slice(0, 5).map((event, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg"
            >
              <span className="text-xl">{getEventIcon(event.eventType)}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-semibold">
                    {formatEventType(event.eventType)}
                  </span>
                  {event.commitCount && ` (${event.commitCount} commits)`}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {event.repository}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    •
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Code Changes */}
      {(data.weeklyStats.additions > 0 || data.weeklyStats.deletions > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">This Week</span>
            <span>
              <span className="text-green-600 dark:text-green-400">
                +{data.weeklyStats.additions}
              </span>
              <span className="text-gray-400 dark:text-gray-500 mx-2">|</span>
              <span className="text-red-600 dark:text-red-400">
                -{data.weeklyStats.deletions}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
