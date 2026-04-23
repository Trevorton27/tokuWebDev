'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatHours, formatRelativeTime } from '@/lib/activityUtils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StudentActivity {
  id: string;
  name: string;
  email: string;
  lastActiveAt: string | null;
  engagementScore: number;
  weeklyMetrics: {
    logins: number;
    sessionTime: number;
    commits: number;
    attempts: number;
  };
  status: 'active' | 'inactive' | 'at-risk';
}

export default function StudentActivityTable() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'at-risk'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentActivity();
  }, []);

  const fetchStudentActivity = async () => {
    try {
      const response = await axios.get('/api/instructor/activity');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student activity:', err);
      setError(t('student.failedToLoadActivity'));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) => filter === 'all' || s.status === filter
  );

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (score >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      inactive: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'at-risk': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClasses[status as keyof typeof badgeClasses]
          }`}
      >
        {status === 'at-risk'
          ? t('instructor.atRisk')
          : status === 'active'
            ? t('student.active')
            : t('student.archived') // Using archived as a fallback for inactive if no specific key
        }
      </span>
    );
  };

  const FilterTab = ({
    label,
    active,
    onClick,
    count,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
    >
      {label}
      {count !== undefined && ` (${count})`}
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || students.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Student Activity Overview
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {error || 'No student data available'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Student Activity Overview
        </h2>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <FilterTab
            label={t('common.all')}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={students.length}
          />
          <FilterTab
            label={t('student.active')}
            active={filter === 'active'}
            onClick={() => setFilter('active')}
            count={students.filter((s) => s.status === 'active').length}
          />
          <FilterTab
            label={t('instructor.atRisk')}
            active={filter === 'at-risk'}
            onClick={() => setFilter('at-risk')}
            count={students.filter((s) => s.status === 'at-risk').length}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.studentName')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.avgScore')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.logins')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.time')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.commits')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.attempts')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.lastActive')}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('instructor.filterStatus')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBackground(
                      student.engagementScore
                    )}`}
                  >
                    <span className="text-sm font-bold">
                      {student.engagementScore}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {student.weeklyMetrics.logins}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {formatHours(student.weeklyMetrics.sessionTime)}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {student.weeklyMetrics.commits}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                  {student.weeklyMetrics.attempts}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                  {student.lastActiveAt
                    ? formatRelativeTime(student.lastActiveAt)
                    : t('instructor.never')}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(student.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
