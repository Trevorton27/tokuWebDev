'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EnrollButton from '@/components/courses/EnrollButton';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
  instructor: {
    id: string;
    name: string | null;
    email: string;
  };
  lessons: {
    id: string;
    title: string;
    content: string;
    order: number;
    duration: number | null;
  }[];
  _count: {
    enrollments: number;
  };
  maxStudents: number | null;
  isEnrolled?: boolean;
  isFull?: boolean;
  availableSlots?: number | null;
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/lms/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
      } else {
        setError(data.error || 'Failed to load course');
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentChange = () => {
    fetchCourse(); // Refresh course data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('courses.courseNotFound') || 'Course Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/student/courses"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {t('courses.backToCourses') || 'Back to Courses'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Link
              href="/student/courses"
              className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('courses.backToCourses') || 'Back to Courses'}
            </Link>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

            <div className="flex items-center space-x-6 text-indigo-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {course.instructor.name || 'Unknown Instructor'}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {course.lessons.length} {t('courses.lessons') || 'lessons'}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {course._count.enrollments} {t('courses.students') || 'students'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('courses.aboutCourse') || 'About This Course'}
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('courses.curriculum') || 'Curriculum'}
              </h2>
              {course.lessons.length === 0 ? (
                <p className="text-gray-600">
                  {t('courses.noLessons') || 'No lessons available yet'}
                </p>
              ) : (
                <div className="space-y-2">
                  {course.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold mr-3">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">{lesson.title}</span>
                        </div>
                        {lesson.duration && (
                          <span className="text-sm text-gray-500">
                            {lesson.duration} {t('courses.minutes') || 'min'}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-8">
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mb-6">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-6xl">
                    📚
                  </div>
                )}
              </div>

              {course.maxStudents && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t('courses.availability') || 'Availability'}:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {course.availableSlots !== undefined
                        ? `${course.availableSlots}/${course.maxStudents} ${t('courses.spotsLeft') || 'spots'}`
                        : `${course._count.enrollments}/${course.maxStudents}`}
                    </span>
                  </div>
                </div>
              )}

              <EnrollButton
                courseId={course.id}
                isEnrolled={course.isEnrolled || false}
                isFull={course.isFull || false}
                onEnrollmentChange={handleEnrollmentChange}
              />

              {course.isEnrolled && (
                <Link
                  href={`/student/courses/${course.id}/learn`}
                  className="mt-3 block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {t('courses.continueLearning') || 'Continue Learning'}
                </Link>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('courses.courseIncludes') || 'This course includes:'}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {course.lessons.length} {t('courses.lessons') || 'lessons'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('courses.lifeTimeAccess') || 'Lifetime access'}
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('courses.instructorSupport') || 'Instructor support'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
