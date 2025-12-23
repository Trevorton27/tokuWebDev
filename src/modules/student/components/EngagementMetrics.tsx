'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDayLabel } from '@/lib/activityUtils';

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

export default function EngagementMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/activity/metrics');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Engagement Score
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'No metrics available'}
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIndicator = () => {
    switch (data.trend) {
      case 'up':
        return (
          <span className="text-sm text-green-600 dark:text-green-400">
            ↗ Trending up
          </span>
        );
      case 'down':
        return (
          <span className="text-sm text-red-600 dark:text-red-400">
            ↘ Trending down
          </span>
        );
      default:
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            → Stable
          </span>
        );
    }
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

    return (
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            {value}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              colorClasses[color as keyof typeof colorClasses]
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Engagement Score
        </h2>
        {data.streak > 0 && (
          <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
            🔥 {data.streak} day streak
          </span>
        )}
      </div>

      {/* Main Score Circle */}
      <div className="relative mb-6">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${
                  2 * Math.PI * 56 * (1 - data.engagementScore / 100)
                }`}
                className={getScoreColor(data.engagementScore)}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.engagementScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  / 100
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2">{getTrendIndicator()}</div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-6">
        <MetricBar label="Login Activity" value={data.breakdown.logins} color="blue" />
        <MetricBar label="Coding Practice" value={data.breakdown.coding} color="green" />
        <MetricBar label="GitHub Activity" value={data.breakdown.github} color="purple" />
        <MetricBar label="Learning Time" value={data.breakdown.learning} color="orange" />
      </div>

      {/* Weekly Trend */}
      {data.weeklyActivity.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Weekly Trend
          </div>
          <div className="flex items-end justify-between space-x-1 h-20">
            {data.weeklyActivity.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t transition-all duration-500"
                  style={{ height: `${day.score}%` }}
                  title={`${day.score}% on ${day.date}`}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDayLabel(day.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
