'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    users: {
      total: number;
      students: number;
      instructors: number;
      admins: number;
    };
    courses: {
      total: number;
      published: number;
      draft: number;
    };
    lessons: {
      total: number;
    };
    enrollments: {
      total: number;
      active: number;
      completed: number;
      completionRate: number;
    };
    assessments: {
      total: number;
      avgScore: number;
      passRate: number;
    };
  };
  trends: {
    newUsers: {
      last7Days: number;
      last30Days: number;
    };
    newEnrollments: {
      last7Days: number;
      last30Days: number;
    };
    recentAttempts: {
      last7Days: number;
      last30Days: number;
    };
    avgEnrollmentProgress: number;
  };
  topPerformers: {
    courses: Array<{
      id: string;
      title: string;
      instructor: string;
      enrollments: number;
      published: boolean;
    }>;
    students: Array<{
      id: string;
      name: string;
      email: string;
      attemptCount: number;
      avgScore: number;
    }>;
  };
}

export default function EngagementAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    color = 'blue',
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'indigo';
    trend?: { label: string; value: number };
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      purple: 'bg-purple-50 text-purple-700',
      orange: 'bg-orange-50 text-orange-700',
      teal: 'bg-teal-50 text-teal-700',
      indigo: 'bg-indigo-50 text-indigo-700',
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
              +{trend.value} {trend.label}
            </div>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
      </div>
    );
  };

  const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-500">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Engagement Analytics</h1>
              <p className="text-gray-600 mt-1">Platform performance and user insights</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={data.overview.users.total}
              subtitle={`${data.overview.users.students} students, ${data.overview.users.instructors} instructors`}
              color="blue"
              trend={{
                label: 'this month',
                value: data.trends.newUsers.last30Days,
              }}
            />
            <MetricCard
              title="Total Courses"
              value={data.overview.courses.total}
              subtitle={`${data.overview.courses.published} published, ${data.overview.courses.draft} draft`}
              color="purple"
            />
            <MetricCard
              title="Total Enrollments"
              value={data.overview.enrollments.total}
              subtitle={`${data.overview.enrollments.completed} completed (${data.overview.enrollments.completionRate}%)`}
              color="green"
              trend={{
                label: 'this month',
                value: data.trends.newEnrollments.last30Days,
              }}
            />
            <MetricCard
              title="Assessment Attempts"
              value={data.overview.assessments.total}
              subtitle={`${data.overview.assessments.passRate}% pass rate, ${data.overview.assessments.avgScore}% avg score`}
              color="orange"
              trend={{
                label: 'this month',
                value: data.trends.recentAttempts.last30Days,
              }}
            />
          </div>
        </div>

        {/* Activity Trends */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">User Growth</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last 7 days</span>
                  <span className="text-2xl font-bold text-blue-600">
                    +{data.trends.newUsers.last7Days}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last 30 days</span>
                  <span className="text-2xl font-bold text-blue-600">
                    +{data.trends.newUsers.last30Days}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Average enrollment progress: {data.trends.avgEnrollmentProgress}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Engagement Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Enrollments</span>
                    <span className="font-semibold">{data.overview.enrollments.active}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (data.overview.enrollments.active /
                            data.overview.enrollments.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Course Completion Rate</span>
                    <span className="font-semibold">
                      {data.overview.enrollments.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${data.overview.enrollments.completionRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Assessment Pass Rate</span>
                    <span className="font-semibold">{data.overview.assessments.passRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${data.overview.assessments.passRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Most Enrolled Courses</h3>
            </div>
            <div className="p-6">
              {data.topPerformers.courses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No courses available</p>
              ) : (
                <div className="space-y-4">
                  {data.topPerformers.courses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">by {course.instructor}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {course.enrollments}
                        </span>
                        <span className="text-xs text-gray-500">students</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Students */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
            </div>
            <div className="p-6">
              {data.topPerformers.students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No assessment data available</p>
              ) : (
                <div className="space-y-4">
                  {data.topPerformers.students.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">
                            {student.attemptCount} attempts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-green-600">
                          {student.avgScore}%
                        </span>
                        <span className="text-xs text-gray-500">avg score</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {data.overview.courses.total}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600">
                {data.overview.lessons.total}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {data.overview.assessments.avgScore}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
