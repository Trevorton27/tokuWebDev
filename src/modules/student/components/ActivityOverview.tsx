'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDuration, formatDateTime } from '@/lib/activityUtils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

interface MetricsData {
  engagementScore: number;
  trend: 'up' | 'down' | 'stable';
  weeklyActivity: Array<{
    date: string;
    score: number;
  }>;
  breakdown: {
    logins: number;
    coding: number;
    github: number;
    learning: number;
  };
  streak: number;
}

export default function ActivityOverview() {
  const { t } = useLanguage();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResponse, metricsResponse] = await Promise.all([
        axios.get('/api/activity/sessions'),
        axios.get('/api/activity/metrics'),
      ]);

      if (sessionsResponse.data.success) {
        setSessionData(sessionsResponse.data.data);
      }
      if (metricsResponse.data.success) {
        setMetricsData(metricsResponse.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch activity data:', err);
      setError(t('student.failedToLoadActivity'));
    } finally {
      setLoading(false);
    }
  };

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

  const getTrendIndicator = () => {
    if (!metricsData) return null;
    switch (metricsData.trend) {
      case 'up':
        return (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {t('student.trendingUp')}
          </span>
        );
      case 'down':
        return (
          <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            {t('student.trendingDown')}
          </span>
        );
      default:
        return (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            → {t('student.stable')}
          </span>
        );
    }
  };

  const getNextBestAction = () => {
    if (!metricsData) return null;

    const { breakdown, engagementScore } = metricsData;

    // Low overall engagement
    if (engagementScore < 30) {
      return t('student.trendingUpAction');
    }

    // Specific area recommendations
    if (breakdown.coding < 20) {
      return t('student.trendingDownAction');
    }
    if (breakdown.github < 20) {
      return t('student.stableAction');
    }
    if (breakdown.learning < 20) {
      return t('student.learningAction');
    }

    return null;
  };

  const MetricBar = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500 dark:bg-blue-400',
      green: 'bg-green-500 dark:bg-green-400',
      purple: 'bg-purple-500 dark:bg-purple-400',
      orange: 'bg-orange-500 dark:bg-orange-400',
    };

    // Show muted state for very low values
    if (value < 5) {
      return (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-500">{label}</span>
            <span className="text-gray-400 dark:text-gray-600 text-xs">{t('student.notEnoughData')}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gray-300 dark:bg-gray-600 h-1.5 rounded-full"
              style={{ width: '5%' }}
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            {value}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]
              }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border h-[580px]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData || !metricsData) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border h-[580px]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Your Progress
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || t('student.noActivityData')}
        </p>
      </div>
    );
  }

  const activeSessions = sessionData.recentSessions.filter((s) => s.isActive);
  const endedSessions = sessionData.recentSessions.filter((s) => !s.isActive);
  const currentSession = activeSessions.length > 0 ? activeSessions[0] : null;
  const nextBestAction = getNextBestAction();

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border h-[580px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('student.yourProgress')}
        </h2>
        {metricsData.streak > 0 && (
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
            🔥 {metricsData.streak} {t('student.days')}
          </span>
        )}
      </div>

      {/* Simplified Engagement Summary */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metricsData.engagementScore}<span className="text-sm text-gray-500 dark:text-gray-400 font-normal">/100</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('student.engagementScore')}</div>
          </div>
          {getTrendIndicator()}
        </div>

        {/* Single overall progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
          <div
            className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${metricsData.engagementScore}%` }}
          />
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="space-y-2.5 mb-4">
        <MetricBar label={t('student.loginActivity')} value={metricsData.breakdown.logins} color="blue" />
        <MetricBar label={t('student.codingPractice')} value={metricsData.breakdown.coding} color="green" />
        <MetricBar label={t('student.githubActivity')} value={metricsData.breakdown.github} color="purple" />
        <MetricBar label={t('student.learningTime')} value={metricsData.breakdown.learning} color="orange" />
      </div>

      {/* Next Best Action */}
      {nextBestAction && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
              <span className="font-semibold">{t('student.nextStep')}</span> {nextBestAction}
            </p>
          </div>
        </div>
      )}

      {/* Collapsed Consistency Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('student.consistency')}</h3>
          <button
            onClick={() => setShowSessionDetails(!showSessionDetails)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            aria-expanded={showSessionDetails}
            aria-label={showSessionDetails ? t('student.hideDetails') : t('student.showDetails')}
          >
            {showSessionDetails ? (
              <>
                {t('student.hideDetails')}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                {t('student.showDetails')}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Compact Summary - Always Visible */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{sessionData.totalSessions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('student.sessions')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatDuration(sessionData.totalTime)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('student.thisWeekTime')}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{metricsData.streak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('student.dayStreak')}</div>
          </div>
        </div>

        {/* Expandable Session Details */}
        {showSessionDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Current Session */}
            {currentSession && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('student.currentSession')}</h4>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getDeviceIcon(currentSession.deviceType)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </span>
                        {t('student.active')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {currentSession.browser} • {formatDuration(currentSession.duration)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {endedSessions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('student.recentActivity')}</h4>
                <div className="space-y-2">
                  {endedSessions.slice(0, 3).map((session, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <span className="opacity-60">{getDeviceIcon(session.deviceType)}</span>
                      <span>{formatDateTime(session.loginAt)}</span>
                      <span>•</span>
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
