'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import axios from 'axios';

interface RoadmapSummary {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  totalHours: number;
  completedHours: number;
}

export default function RoadmapProgress() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [nextItem, setNextItem] = useState<{ title: string; type: string } | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [summaryRes, nextRes] = await Promise.all([
          axios.get('/api/roadmap?summary=true'),
          axios.get('/api/roadmap?next=true'),
        ]);

        if (summaryRes.data.success && summaryRes.data.data.summary) {
          setSummary(summaryRes.data.data.summary);
        }
        if (nextRes.data.success && nextRes.data.data.nextItem) {
          setNextItem(nextRes.data.data.nextItem);
        }
      } catch (err) {
        console.error('Failed to fetch roadmap progress', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Calculate progress values
  const overallProgress = summary
    ? Math.round((summary.completedItems / Math.max(summary.totalItems, 1)) * 100)
    : 0;
  const completedItems = summary?.completedItems || 0;
  const totalItems = summary?.totalItems || 0;
  const inProgressItems = summary?.inProgressItems || 0;
  const remainingHours = summary ? Math.round(summary.totalHours - summary.completedHours) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('student.learningProgress')}</h2>
        <Link
          href="/student/roadmap"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t('student.viewFullRoadmap')}
        </Link>
      </div>

      {/* Overall Course Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{t('student.overallProgress')}</span>
          <span className="text-2xl font-bold text-indigo-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {completedItems} {t('student.of')} {totalItems} {t('student.itemsCompleted')}
        </p>
      </div>

      {/* Next Up */}
      {nextItem ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">{t('student.nextUp')}</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {nextItem.type}
            </span>
          </div>
          <p className="text-sm text-gray-800 font-medium">{nextItem.title}</p>
          <Link
            href="/student/roadmap"
            className="mt-2 inline-block text-xs text-indigo-600 hover:text-indigo-700"
          >
            {t('student.startNow')} →
          </Link>
        </div>
      ) : totalItems === 0 ? (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
          <p className="text-sm text-gray-700 mb-2">{t('student.noRoadmapYet')}</p>
          <Link
            href="/assessment/intake"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('student.takeAssessmentCta')} →
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
          <p className="text-sm text-green-700 font-medium">🎉 {t('student.allCompleted')}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{completedItems}</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.completed')}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{inProgressItems}</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.inProgress')}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{remainingHours}h</div>
          <div className="text-xs text-gray-600 mt-1">{t('student.remaining')}</div>
        </div>
      </div>
    </div>
  );
}
