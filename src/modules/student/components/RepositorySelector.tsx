/**
 * Repository Selector Component
 * Browse and connect GitHub repositories to student profile
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  private: boolean;
  updatedAt: string;
}

interface ConnectedRepo {
  id: string;
  name: string;
  url: string;
  connectedAt: string;
}

export default function RepositorySelector() {
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<ConnectedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reposResponse, connectedResponse] = await Promise.all([
        axios.get('/api/github/repositories'),
        axios.get('/api/github/connected-repos'),
      ]);

      if (reposResponse.data.success) {
        setAvailableRepos(reposResponse.data.repositories);
      }

      if (connectedResponse.data.success) {
        setConnectedRepos(connectedResponse.data.repositories);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch repositories';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (repoFullName: string) => {
    return connectedRepos.some((repo) => repo.name === repoFullName);
  };

  const connectRepository = async (repo: Repository) => {
    try {
      const response = await axios.post('/api/github/connected-repos', {
        repoName: repo.fullName,
        repoUrl: repo.url,
        metadata: {
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
        },
      });

      if (response.data.success) {
        setConnectedRepos([
          ...connectedRepos,
          {
            id: response.data.repository.id,
            name: response.data.repository.name,
            url: response.data.repository.url,
            connectedAt: response.data.repository.connectedAt,
          },
        ]);
        setMessage({
          type: 'success',
          text: `${repo.name} connected successfully!`,
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to connect repository',
      });
    }
  };

  const disconnectRepository = async (repoName: string) => {
    try {
      const response = await axios.delete(
        `/api/github/connected-repos?name=${encodeURIComponent(repoName)}`
      );

      if (response.data.success) {
        setConnectedRepos(connectedRepos.filter((repo) => repo.name !== repoName));
        setMessage({
          type: 'success',
          text: 'Repository disconnected successfully',
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to disconnect repository',
      });
    }
  };

  const filteredRepos = availableRepos.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Connected Repositories */}
      {connectedRepos.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Connected Repositories ({connectedRepos.length})
          </h3>
          <div className="space-y-3">
            {connectedRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-900 dark:text-green-100 hover:underline"
                  >
                    {repo.name}
                  </a>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Connected {new Date(repo.connectedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => disconnectRepository(repo.name)}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Repositories */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Repositories
        </h3>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
          />
        </div>

        {/* Repository List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredRepos.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {searchTerm ? 'No repositories match your search' : 'No repositories found'}
            </p>
          ) : (
            filteredRepos.map((repo) => {
              const connected = isConnected(repo.fullName);
              return (
                <div
                  key={repo.id}
                  className="flex items-start justify-between p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {repo.fullName}
                      </a>
                      {repo.private && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stars}</span>
                      <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => connected ? disconnectRepository(repo.fullName) : connectRepository(repo)}
                    className={`ml-4 px-4 py-2 text-sm font-medium rounded transition-colors ${
                      connected
                        ? 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
