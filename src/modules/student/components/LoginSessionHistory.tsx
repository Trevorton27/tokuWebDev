'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDuration, formatDateTime } from '@/lib/activityUtils';

interface SessionData {
  recentSessions: Array<{
    loginAt: string;
    duration: number;
    deviceType: string;
    browser: string;
    isActive: boolean;
  }>;
  totalSessions: number;
  totalTime: number;
  avgDuration: number;
  activeSessions: number;
}

export default function LoginSessionHistory() {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/activity/sessions');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Login Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'No session data available'}
        </p>
      </div>
    );
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📲';
      case 'desktop':
      default:
        return '💻';
    }
  };

  // Separate active and ended sessions
  const activeSessions = data.recentSessions.filter((s) => s.isActive);
  const endedSessions = data.recentSessions.filter((s) => !s.isActive);

  // Get the most recent active session (there should ideally be only one)
  const currentSession = activeSessions.length > 0 ? activeSessions[0] : null;

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Login Activity
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalSessions}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Sessions (7d)
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatDuration(data.totalTime)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Total Time
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(data.avgDuration)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Avg Duration
          </div>
        </div>
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Current Session
          </h3>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getDeviceIcon(currentSession.deviceType)}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Active Now
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {currentSession.browser} • {currentSession.deviceType}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Started {formatDateTime(currentSession.loginAt)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDuration(currentSession.duration)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  session time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Timeline */}
      {endedSessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {endedSessions.slice(0, 4).map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg opacity-60">
                    {getDeviceIcon(session.deviceType)}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(session.loginAt)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.browser} • {formatDuration(session.duration)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentSession && endedSessions.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No session activity found
        </p>
      )}
    </div>
  );
}
