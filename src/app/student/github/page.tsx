/**
 * GitHub Configuration Page
 * Student interface for managing GitHub integration
 */

'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import GitHubProfileForm from '@/modules/student/components/GitHubProfileForm';
import WebhookTokenManager from '@/modules/student/components/WebhookTokenManager';
import RepositorySelector from '@/modules/student/components/RepositorySelector';
import GitHubActivityGraph from '@/modules/student/components/GitHubActivityGraph';
import ConnectedProjects from '@/modules/student/components/ConnectedProjects';

export default function GitHubConfigPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'webhook' | 'repos' | 'activity'>('profile');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'webhook' as const, label: 'Webhook', icon: '🔐' },
    { id: 'repos' as const, label: 'Repositories', icon: '📦' },
    { id: 'activity' as const, label: 'Activity', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          GitHub Integration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your GitHub account to track your coding activity and showcase your projects
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              GitHub Profile
            </h2>
            <GitHubProfileForm />
          </div>
        )}

        {activeTab === 'webhook' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Webhook Configuration
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Generate a webhook token to enable real-time activity tracking from your GitHub repositories.
            </p>
            <WebhookTokenManager />
          </div>
        )}

        {activeTab === 'repos' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connected Repositories
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select which repositories you want to track for your student profile.
            </p>
            <RepositorySelector />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                GitHub Activity
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Visual overview of your GitHub contributions and coding activity.
              </p>
              <GitHubActivityGraph />
            </div>

            {/* Connected Projects Section */}
            <ConnectedProjects />
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Need Help?
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>Step 1:</strong> Configure your GitHub profile with your username and email.
          </p>
          <p>
            <strong>Step 2:</strong> Generate a webhook token and add it to your GitHub repository settings.
          </p>
          <p>
            <strong>Step 3:</strong> Select which repositories you want to track for your profile.
          </p>
          <p>
            <strong>Step 4:</strong> Monitor your activity through the Activity tab.
          </p>
        </div>
      </div>
    </div>
  );
}
