'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GoogleCalendarSettings from '@/components/calendar/GoogleCalendarSettings';

function SettingsContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Handle OAuth callback notifications
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'google_calendar_connected') {
      setNotification({
        type: 'success',
        message: 'Google Calendar connected successfully! Your events will now sync automatically.',
      });
      // Clear URL parameters
      router.replace('/student/settings');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        google_calendar_denied: 'Google Calendar connection was denied.',
        invalid_callback: 'Invalid OAuth callback. Please try again.',
        invalid_state: 'Invalid OAuth state. Please try again.',
        config_error: 'Google Calendar is not properly configured. Please contact support.',
        incomplete_tokens: 'Failed to receive complete tokens from Google. Please try again.',
      };

      setNotification({
        type: 'error',
        message: errorMessages[error] || `Error: ${error}`,
      });
      // Clear URL parameters
      router.replace('/student/settings');
    }
  }, [searchParams, router]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const userName = user?.firstName || user?.fullName || user?.username || 'Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Header Section */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your account and integration settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Google Calendar Integration */}
          {user?.id && <GoogleCalendarSettings userId={user.id} />}

          {/* Account Settings Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <p className="text-sm text-gray-600">
              Additional account settings coming soon...
            </p>
          </div>

          {/* Notification Preferences Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <p className="text-sm text-gray-600">
              Notification preferences coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentSettings() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
