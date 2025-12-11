'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    instructor: {
      name: string | null;
    };
    _count: {
      lessons: number;
    };
  };
}

export default function MyCourses() {
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lms/enrollments');
      const data = await response.json();

      if (data.success) {
        // Only show ACTIVE enrollments
        const activeEnrollments = data.data.filter((e: any) => e.status === 'ACTIVE');
        setEnrollments(activeEnrollments);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('student.myCourses') || 'My Courses'}
            </h2>
            <p className="text-sm text-gray-500">
              {enrollments.length} {t('student.activeEnrollments') || 'active enrollments'}
            </p>
          </div>
        </div>
        <Link
          href="/student/courses"
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center"
        >
          {t('student.browseCourses') || 'Browse Courses'}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-600 mb-4">
            {t('student.noCoursesYet') || 'You haven\'t enrolled in any courses yet'}
          </p>
          <Link
            href="/student/courses"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {t('student.exploreCourses') || 'Explore Courses'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.slice(0, 3).map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/student/courses/${enrollment.course.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {enrollment.course.instructor.name || 'Unknown Instructor'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  {enrollment.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {enrollment.course._count.lessons} {t('student.lessons') || 'lessons'}
                </span>
                <span>
                  {enrollment.progress === 100
                    ? t('student.completed') || 'Completed'
                    : t('student.inProgress') || 'In Progress'}
                </span>
              </div>
            </Link>
          ))}

          {enrollments.length > 3 && (
            <Link
              href="/student/courses?filter=enrolled"
              className="block text-center text-indigo-600 hover:text-indigo-700 font-medium text-sm pt-2"
            >
              {t('student.viewAllCourses') || `View all ${enrollments.length} courses`}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
