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

      {/* Recent Sessions */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Recent Sessions
        </h3>
        {data.recentSessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent sessions
          </p>
        ) : (
          data.recentSessions.slice(0, 5).map((session, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {getDeviceIcon(session.deviceType)}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDateTime(session.loginAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {session.browser} • {session.deviceType}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {session.isActive ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Active
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDuration(session.duration)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ended
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDuration(session.duration)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
