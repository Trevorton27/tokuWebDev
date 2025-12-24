/**
 * GitHub Activity Dashboard Widget
 * Shows GitHub connectivity status and connected projects
 * Links to /student/github for full management
 */

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface ConnectedRepo {
  id: string;
  name: string;
  url: string;
  metadata?: {
    description?: string;
    language?: string;
    stars?: number;
  };
}

interface GitHubStatus {
  isConfigured: boolean;
  username?: string;
  email?: string;
  connectedRepos: ConnectedRepo[];
}

export default function GitHubActivity() {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGitHubStatus();
  }, []);

  const fetchGitHubStatus = async () => {
    try {
      // Check if user has configured GitHub profile
      const profileResponse = await axios.get('/api/github/profile');
      const hasUsername = !!profileResponse.data.profile?.username;
      const hasEmail = !!profileResponse.data.profile?.email;
      const isConfigured = hasUsername && hasEmail;

      // Fetch connected repos if configured
      let connectedRepos: ConnectedRepo[] = [];
      if (isConfigured) {
        try {
          const reposResponse = await axios.get('/api/github/connected-repos');
          if (reposResponse.data.success) {
            connectedRepos = reposResponse.data.repositories;
          }
        } catch (err) {
          console.error('Failed to fetch connected repos:', err);
        }
      }

      setStatus({
        isConfigured,
        username: profileResponse.data.profile?.username,
        email: profileResponse.data.profile?.email,
        connectedRepos,
      });
    } catch (err) {
      console.error('Failed to fetch GitHub status:', err);
      setStatus({
        isConfigured: false,
        connectedRepos: [],
      });
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

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>GitHub Activity</span>
        </h2>
        <Link
          href="/student/github"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      {!status?.isConfigured ? (
        // Not Configured State
        <div className="text-center py-8">
          <div className="text-5xl mb-3">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Configure GitHub Connectivity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Connect your GitHub account to track your coding activity
          </p>
          <Link
            href="/student/github"
            className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      ) : (
        // Configured State - Show Connected Projects
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Connected as @{status.username}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {status.email}
                </p>
              </div>
            </div>
          </div>

          {/* Connected Projects */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Connected Projects
            </h3>

            {status.connectedRepos.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                <div className="text-3xl mb-2">📦</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  No projects connected yet
                </p>
                <Link
                  href="/student/github"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Connect a Repository →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {status.connectedRepos.slice(0, 3).map((repo) => (
                  <div
                    key={repo.id}
                    className="p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📂</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {repo.name.split('/').pop()}
                        </p>
                        {repo.metadata?.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                            {repo.metadata.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {repo.metadata?.language && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {repo.metadata.language}
                            </span>
                          )}
                          {repo.metadata?.stars !== undefined && repo.metadata.stars > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ⭐ {repo.metadata.stars}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {status.connectedRepos.length > 3 && (
                  <div className="pt-2 text-center">
                    <Link
                      href="/student/github"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      View {status.connectedRepos.length - 3} more →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
