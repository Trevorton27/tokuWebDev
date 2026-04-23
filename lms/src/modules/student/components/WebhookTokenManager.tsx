/**
 * Webhook Token Manager Component
 * Manage GitHub webhook secret (manual input from GitHub)
 */

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WebhookTokenManager() {
  const [webhookSecret, setWebhookSecret] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [hasSecret, setHasSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // GitHub PAT state
  const [githubPat, setGithubPat] = useState('');
  const [hasGithubPat, setHasGithubPat] = useState(false);
  const [showGithubPat, setShowGithubPat] = useState(false);
  const [savingPat, setSavingPat] = useState(false);
  const [patMessage, setPatMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user ID
      const userResponse = await axios.get('/api/auth/me');
      if (userResponse.data.id) {
        setUserId(userResponse.data.id);
        setWebhookUrl(
          `${window.location.origin}/api/webhooks/github/${userResponse.data.id}`
        );
      }

      // Check if webhook secret exists
      const tokenResponse = await axios.get('/api/github/token');
      if (tokenResponse.data.success) {
        setHasSecret(true);
      }

      // Fetch GitHub PAT status
      const patResponse = await axios.get('/api/github/pat');
      if (patResponse.data.success) {
        setHasGithubPat(patResponse.data.hasToken);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveWebhookSecret = async () => {
    if (!webhookSecret.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your GitHub webhook secret',
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/github/token', {
        token: webhookSecret,
        manualInput: true
      });

      if (response.data.success) {
        setHasSecret(true);
        setWebhookSecret('');
        setShowSecret(false);
        setMessage({
          type: 'success',
          text: 'Webhook secret saved successfully!',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save webhook secret';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteWebhookSecret = async () => {
    if (!confirm('Are you sure you want to delete your webhook secret? This will stop activity tracking.')) {
      return;
    }

    try {
      await axios.delete('/api/github/token');
      setHasSecret(false);
      setWebhookSecret('');
      setMessage({
        type: 'success',
        text: 'Webhook secret deleted successfully',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete webhook secret',
      });
    }
  };

  const copyUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const saveGithubPat = async () => {
    if (!githubPat.trim()) {
      setPatMessage({
        type: 'error',
        text: 'Please enter a GitHub Personal Access Token',
      });
      return;
    }

    setSavingPat(true);
    setPatMessage(null);

    try {
      const response = await axios.post('/api/github/pat', { token: githubPat });
      if (response.data.success) {
        setHasGithubPat(true);
        setGithubPat('');
        setShowGithubPat(false);
        setPatMessage({
          type: 'success',
          text: 'GitHub Personal Access Token saved successfully!',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save token';
      setPatMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setSavingPat(false);
    }
  };

  const deleteGithubPat = async () => {
    if (!confirm('Are you sure you want to delete your GitHub Personal Access Token?')) {
      return;
    }

    try {
      await axios.delete('/api/github/pat');
      setHasGithubPat(false);
      setGithubPat('');
      setPatMessage({
        type: 'success',
        text: 'GitHub Personal Access Token deleted successfully',
      });
    } catch (error) {
      setPatMessage({
        type: 'error',
        text: 'Failed to delete token',
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      {/* Webhook URL Display */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🔗 Your Unique Webhook URL
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono text-xs"
          />
          <button
            onClick={copyUrl}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            {copiedUrl ? '✓ Copied' : '📋 Copy URL'}
          </button>
        </div>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ⚠️ This URL is unique to you. Do not share it publicly.
        </p>
      </div>

      {/* Webhook Secret Input/Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          🔐 GitHub Webhook Secret
        </h3>

        {hasSecret ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                Webhook secret configured
              </span>
            </div>
            <button
              onClick={deleteWebhookSecret}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Remove Secret
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste your GitHub webhook secret
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Enter secret from GitHub..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-3 py-2 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  {showSecret ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              onClick={saveWebhookSecret}
              disabled={saving || !webhookSecret.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Webhook Secret'}
            </button>
          </div>
        )}
      </div>

      {/* Webhook Setup Instructions */}
      <div className="mb-6 bg-gray-50 dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          📚 GitHub Webhook Setup Instructions
        </h4>
        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
          <li>
            Go to your GitHub repository:
            <strong className="text-gray-900 dark:text-white"> Settings → Webhooks → Add webhook</strong>
          </li>
          <li>
            <strong>Payload URL:</strong> Copy your unique URL above
            <div className="ml-6 mt-1 p-2 bg-white dark:bg-dark-card rounded border border-gray-300 dark:border-dark-border">
              <code className="text-xs font-mono text-blue-600 dark:text-blue-400 break-all">
                {webhookUrl}
              </code>
            </div>
          </li>
          <li>
            <strong>Content type:</strong> application/json
          </li>
          <li>
            <strong>Secret:</strong> Generate a secret on GitHub (Settings → Webhooks → Secret field)
          </li>
          <li>
            Copy that secret and paste it in the "GitHub Webhook Secret" field above
          </li>
          <li>
            <strong>Events:</strong> Select "Send me everything" or choose specific events
          </li>
          <li className="text-green-700 dark:text-green-400 font-medium">
            ✅ Click "Add webhook" on GitHub, then save your secret above
          </li>
        </ol>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-xs text-yellow-900 dark:text-yellow-200">
            <strong>⚠️ Important:</strong> Use the SAME secret for ALL your repositories.
            Each repo should point to your unique URL above with the same secret.
          </p>
        </div>
      </div>

      {/* GitHub Personal Access Token Section - Always Visible */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">⚡</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
              GitHub Personal Access Token (Optional)
            </h4>
            <p className="text-xs text-purple-800 dark:text-purple-200 mb-2">
              Add your own token to avoid rate limiting (increases from 60 to 5,000 requests/hour)
            </p>
          </div>
        </div>

        {hasGithubPat ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                Personal Access Token configured
              </span>
            </div>
            <button
              onClick={deleteGithubPat}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Remove Token
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-purple-900 dark:text-purple-100 mb-2">
                Paste your GitHub Personal Access Token
              </label>
              <div className="flex gap-2">
                <input
                  type={showGithubPat ? 'text' : 'password'}
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="flex-1 px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={() => setShowGithubPat(!showGithubPat)}
                  className="px-3 py-2 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
                >
                  {showGithubPat ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded p-3 text-xs space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">How to create:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                  Go to{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    GitHub Settings → Tokens
                  </a>
                </li>
                <li>Click "Generate new token (classic)"</li>
                <li>Select scopes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">public_repo</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">read:user</code></li>
                <li>Generate and paste it above</li>
              </ol>
            </div>

            <button
              onClick={saveGithubPat}
              disabled={savingPat || !githubPat.trim()}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {savingPat ? 'Saving...' : 'Save Personal Access Token'}
            </button>
          </div>
        )}

        {patMessage && (
          <div
            className={`mt-3 p-3 rounded-lg text-sm ${
              patMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {patMessage.text}
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}
    </div>
  );
}
