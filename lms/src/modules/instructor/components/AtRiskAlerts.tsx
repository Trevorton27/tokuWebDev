'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatRelativeTime } from '@/lib/activityUtils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StudentActivity {
  id: string;
  name: string;
  email: string;
  lastActiveAt: string | null;
  engagementScore: number;
  status: 'active' | 'inactive' | 'at-risk';
}

export default function AtRiskAlerts() {
  const { t } = useLanguage();
  const [atRiskStudents, setAtRiskStudents] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAtRiskStudents();
  }, []);

  const fetchAtRiskStudents = async () => {
    try {
      const response = await axios.get('/api/instructor/activity');
      if (response.data.success) {
        const atRisk = response.data.data.filter(
          (s: StudentActivity) => s.status === 'at-risk'
        );
        setAtRiskStudents(atRisk);
      }
    } catch (err) {
      console.error('Failed to fetch at-risk students:', err);
      setError(t('student.failedToLoadActivity'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('instructor.atRiskTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (atRiskStudents.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('instructor.atRiskTitle')}
          </h2>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
            {t('instructor.allStudentsEngaged')}
          </span>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('instructor.noStudentsAtRisk')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('instructor.atRiskTitle')}
        </h2>
        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
          {t('instructor.studentsNeedAttention', { count: atRiskStudents.length })}
        </span>
      </div>

      <div className="space-y-3">
        {atRiskStudents.map((student) => (
          <div
            key={student.id}
            className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.email}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {student.engagementScore}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('instructor.engagement')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ⚠️ {t('instructor.lastActive')}:{' '}
                  {student.lastActiveAt
                    ? formatRelativeTime(student.lastActiveAt)
                    : t('instructor.never')}
                </span>
              </div>
              <button
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors"
                onClick={() => {
                  // TODO: Implement send reminder functionality
                  alert(t('instructor.reminderSent', { name: student.name }));
                }}
              >
                {t('instructor.sendReminder')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('instructor.atRiskSubtitle')}
        </p>
      </div>
    </div>
  );
}
