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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100 mb-1.5">
          GitHub Integration
        </h1>
        <p className="text-slate-400">
          Connect your GitHub account to track your coding activity and showcase your projects
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800/50 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isActivityTab = tab.id === 'activity';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500/50
                  ${
                    isActive && isActivityTab
                      ? 'border-green-500 text-green-400'
                      : isActive
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }
                `}
              >
                <span
                  className={`text-base transition-all ${
                    isActive ? 'opacity-100' : 'opacity-40 grayscale'
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-5">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-lg font-medium text-slate-200 mb-1">
              GitHub Profile
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Configure your GitHub username and email for activity tracking
            </p>
            <GitHubProfileForm />
          </div>
        )}

        {activeTab === 'webhook' && (
          <div>
            <h2 className="text-lg font-medium text-slate-200 mb-1">
              Webhook Configuration
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Set up webhook token to enable real-time activity tracking from your repositories
            </p>
            <WebhookTokenManager />
          </div>
        )}

        {activeTab === 'repos' && (
          <div>
            <h2 className="text-lg font-medium text-slate-200 mb-1">
              Connected Repositories
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Select which repositories you want to track for your profile
            </p>
            <RepositorySelector />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-medium text-slate-200 mb-1">
                GitHub Activity
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Visual overview of your GitHub contributions and coding activity
              </p>
              <GitHubActivityGraph />
            </div>

            {/* Connected Projects Section */}
            <ConnectedProjects />
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-slate-900/40 border border-slate-800/50 rounded-lg p-5">
        <h3 className="text-base font-medium text-slate-200 mb-3">
          Need Help?
        </h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            <strong className="text-slate-300">Step 1:</strong> Configure your GitHub profile with your username and email.
          </p>
          <p>
            <strong className="text-slate-300">Step 2:</strong> Set up webhook token and add it to your GitHub repository settings.
          </p>
          <p>
            <strong className="text-slate-300">Step 3:</strong> Select which repositories you want to track for your profile.
          </p>
          <p>
            <strong className="text-slate-300">Step 4:</strong> Monitor your activity through the Activity tab.
          </p>
        </div>
      </div>
    </div>
  );
}
