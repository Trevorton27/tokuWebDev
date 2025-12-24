/**
 * Repository Activity Modal
 * Displays detailed activity and stats for a specific repository
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface RepoActivityModalProps {
  repoName: string;
  onClose: () => void;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface Event {
  id: string;
  type: string;
  createdAt: string;
  actor: string;
  payload: any;
}

interface RepoData {
  repository: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    language: string;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    size: number;
    defaultBranch: string;
    private: boolean;
  };
  recentCommits: Commit[];
  recentEvents: Event[];
  stats: {
    totalCommits: string | number;
    commitsLast30Days: number;
    eventsLast30Days: number;
    lastPushed: string;
  };
}

export default function RepoActivityModal({
  repoName,
  onClose,
}: RepoActivityModalProps) {
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepoActivity();
  }, [repoName]);

  const fetchRepoActivity = async () => {
    try {
      const response = await axios.get(
        `/api/github/repo-activity/${encodeURIComponent(repoName)}`
      );

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load repository activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent':
        return '📤';
      case 'PullRequestEvent':
        return '🔀';
      case 'IssuesEvent':
        return '📋';
      case 'CreateEvent':
        return '✨';
      case 'DeleteEvent':
        return '🗑️';
      case 'WatchEvent':
        return '⭐';
      case 'ForkEvent':
        return '🍴';
      default:
        return '📌';
    }
  };

  const getEventLabel = (type: string) => {
    return type.replace('Event', '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {repoName.split('/')[1] || repoName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {repoName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Repository Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
                {data.repository.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {data.repository.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {data.repository.stars}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Stars
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {data.repository.forks}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Forks
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {data.repository.openIssues}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Open Issues
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {data.repository.language || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Language
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Last pushed: {formatDate(data.repository.pushedAt)}
                  </span>
                  <a
                    href={data.repository.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    View on GitHub
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.stats.totalCommits}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Recent Commits
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.stats.commitsLast30Days}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Commits (30d)
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {data.stats.eventsLast30Days}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Events (30d)
                  </div>
                </div>
              </div>

              {/* Recent Commits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Commits
                </h3>
                {data.recentCommits.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent commits
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.recentCommits.map((commit) => (
                      <a
                        key={commit.sha}
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {commit.sha}
                          </code>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {commit.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {commit.author} · {formatDate(commit.date)}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Events */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Events
                </h3>
                {data.recentEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent events
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data.recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getEventIcon(event.type)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {getEventLabel(event.type)}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                by {event.actor}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(event.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
