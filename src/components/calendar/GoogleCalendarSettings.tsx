'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GoogleCalendarStatus {
  connected: boolean;
  calendarId?: string;
  lastSync?: Date;
  tokenExpiry?: Date;
}

interface GoogleCalendarSettingsProps {
  userId: string;
}

export default function GoogleCalendarSettings({ userId }: GoogleCalendarSettingsProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load connection status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/google-calendar/token');
      const data = await response.json();

      if (data.success) {
        setStatus({
          connected: data.connected,
          calendarId: data.calendarId,
          lastSync: data.lastSync ? new Date(data.lastSync) : undefined,
          tokenExpiry: data.tokenExpiry ? new Date(data.tokenExpiry) : undefined,
        });
      } else {
        setError(data.error || t('student.failedToLoadStatus'));
      }
    } catch (err) {
      setError(t('student.failedToLoadStatus'));
      console.error('Failed to load Google Calendar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = '/api/google-calendar/auth';
  };

  const handleDisconnect = async () => {
    if (!confirm(t('student.disconnectConfirm'))) {
      return;
    }

    try {
      setDisconnecting(true);
      setError(null);
      const response = await fetch('/api/google-calendar/token', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ connected: false });
        setSyncResult(null);
      } else {
        setError(data.error || t('student.failedToDisconnect'));
      }
    } catch (err) {
      setError(t('student.failedToDisconnect'));
      console.error('Failed to disconnect:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncResult(null);

      const response = await fetch('/api/google-calendar/sync/batch', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncResult(data.result);
        // Reload status to update lastSync timestamp
        await loadStatus();
      } else {
        setError(data.error || t('student.failedToSync'));
      }
    } catch (err) {
      setError(t('student.failedToSync'));
      console.error('Failed to sync events:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('student.calendarIntegration')}</h2>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{t('student.calendarIntegration')}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {status?.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-900">{t('student.connectedToCalendar')}</p>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            {status.calendarId && (
              <p>
                <span className="font-medium">Calendar:</span> {status.calendarId}
              </p>
            )}
            {status.lastSync && (
              <p>
                <span className="font-medium">{t('student.lastSync')}:</span>{' '}
                {format(status.lastSync, 'PPp')}
              </p>
            )}
            {status.tokenExpiry && (
              <p>
                <span className="font-medium">{t('student.tokenExpires')}:</span>{' '}
                {format(status.tokenExpiry, 'PPp')}
              </p>
            )}
          </div>

          {syncResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">{t('student.syncComplete')}</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>{t('student.totalEvents')}: {syncResult.total}</p>
                <p>{t('student.created')}: {syncResult.created}</p>
                <p>{t('student.updated')}: {syncResult.updated}</p>
                {syncResult.failed > 0 && (
                  <p className="text-red-600">{t('student.failed')}: {syncResult.failed}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncing ? t('student.syncing') : t('student.syncNow')}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disconnecting ? t('student.disconnecting') : t('student.disconnect')}
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              {t('student.calendarSyncNotice')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <p className="text-sm font-medium text-gray-900">{t('student.notConnected')}</p>
          </div>

          <p className="text-sm text-gray-600">
            {t('student.connectCalendarIntro')}
          </p>

          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('instructor.connectGoogleCalendar')}
          </button>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 mb-2 font-medium">{t('student.connectBenefitsHeader')}</p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>{t('student.benefit1')}</li>
              <li>{t('student.benefit2')}</li>
              <li>{t('student.benefit3')}</li>
              <li>{t('student.benefit4')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
