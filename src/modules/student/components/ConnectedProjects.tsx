/**
 * Connected Projects Component
 * Displays connected repositories with click-to-view-details
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import RepoActivityModal from './RepoActivityModal';

interface ConnectedRepo {
  id: string;
  name: string;
  url: string;
  connectedAt: string;
  metadata?: {
    description?: string;
    language?: string;
    stars?: number;
  };
}

export default function ConnectedProjects() {
  const [repos, setRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectedRepos();
  }, []);

  const fetchConnectedRepos = async () => {
    try {
      const response = await axios.get('/api/github/connected-repos');
      if (response.data.success) {
        setRepos(response.data.repositories);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load connected projects');
    } finally {
      setLoading(false);
    }
  };

  const handleRepoClick = (repoName: string) => {
    setSelectedRepo(repoName);
  };

  const handleCloseModal = () => {
    setSelectedRepo(null);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connected Projects
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Projects
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            No connected projects yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Visit the Repositories tab to connect your GitHub projects
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Projects ({repos.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Click on a project to view detailed activity and statistics
        </p>

        <div className="space-y-3">
          {repos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => handleRepoClick(repo.name)}
              className="w-full text-left p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">📂</span>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {repo.name}
                    </h4>
                  </div>

                  {repo.metadata?.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {repo.metadata.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {repo.metadata?.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        {repo.metadata.language}
                      </span>
                    )}
                    {repo.metadata?.stars !== undefined && (
                      <span>⭐ {repo.metadata.stars}</span>
                    )}
                    <span>
                      Connected {new Date(repo.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedRepo && (
        <RepoActivityModal
          repoName={selectedRepo}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
