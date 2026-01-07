/**
 * GitHub Profile Form Component
 * Configure GitHub username and email, display GitHub profile
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  company: string;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  html_url: string;
  created_at: string;
}

export default function GitHubProfileForm() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [githubProfile, setGithubProfile] = useState<GitHubUser | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/github/profile');
      if (response.data.success) {
        setUsername(response.data.profile.username || '');
        setEmail(response.data.profile.email || '');

        // If username exists, fetch GitHub profile
        if (response.data.profile.username) {
          fetchGitHubProfile(response.data.profile.username);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubProfile = async (githubUsername: string) => {
    setFetchingProfile(true);
    try {
      const response = await fetch(
        `https://api.github.com/users/${githubUsername}`
      );
      if (response.ok) {
        const data = await response.json();
        setGithubProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub profile:', error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validate required fields
    if (!username.trim()) {
      setMessage({
        type: 'error',
        text: t('student.githubUsernameRequired'),
      });
      setSaving(false);
      return;
    }

    if (!email.trim()) {
      setMessage({
        type: 'error',
        text: t('student.emailRequired'),
      });
      setSaving(false);
      return;
    }

    try {
      const response = await axios.put('/api/github/profile', {
        username: username.trim(),
        email: email.trim(),
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: t('student.profileUpdated'),
        });

        // Fetch GitHub profile after successful save
        fetchGitHubProfile(username.trim());
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || t('student.failedToUpdateProfile');
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GitHub Profile Display */}
      {githubProfile && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-surface dark:to-blue-900/20 rounded-xl shadow-md p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <img
              src={githubProfile.avatar_url}
              alt={githubProfile.login}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
            />

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {githubProfile.name || githubProfile.login}
                  </h3>
                  <a
                    href={githubProfile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    @{githubProfile.login}
                  </a>
                </div>
                <a
                  href={githubProfile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {t('student.viewOnGithub')}
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>

              {githubProfile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {githubProfile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {githubProfile.company && (
                  <span className="flex items-center gap-1">
                    🏢 {githubProfile.company}
                  </span>
                )}
                {githubProfile.location && (
                  <span className="flex items-center gap-1">
                    📍 {githubProfile.location}
                  </span>
                )}
                {githubProfile.blog && (
                  <a
                    href={
                      githubProfile.blog.startsWith('http')
                        ? githubProfile.blog
                        : `https://${githubProfile.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    🔗 {githubProfile.blog}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {githubProfile.followers}
                  </span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('student.followers')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {githubProfile.following}
                  </span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('student.following')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {githubProfile.public_repos}
                  </span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('student.repositories')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="github-username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('student.githubUsername')} <span className="text-red-500">*</span>
            </label>
            <input
              id="github-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="octocat"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('student.githubUsernameDesc')}
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="github-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t('student.githubEmail')} <span className="text-red-500">*</span>
            </label>
            <input
              id="github-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="octocat@github.com"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('student.githubEmailDesc')}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || fetchingProfile}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {saving
                ? t('student.saving')
                : fetchingProfile
                  ? t('student.loadingProfile')
                  : t('student.saveProfile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
