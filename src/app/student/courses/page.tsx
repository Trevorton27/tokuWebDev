'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import CourseCard from '@/components/courses/CourseCard';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  instructor: {
    name: string | null;
  };
  _count: {
    lessons: number;
    enrollments: number;
  };
  isEnrolled: boolean;
  isFull: boolean;
  availableSlots: number | null;
  maxStudents: number | null;
}

export default function CoursesPage() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'enrolled'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lms/courses/available');
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentChange = () => {
    fetchCourses(); // Refresh the courses list
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'enrolled') return course.isEnrolled;
    if (filter === 'available') return !course.isEnrolled && !course.isFull;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('courses.title') || 'Course Catalog'}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('courses.subtitle') || 'Browse and enroll in courses to start your learning journey'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                filter === 'all'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('courses.allCourses') || 'All Courses'}
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                filter === 'available'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('courses.available') || 'Available'}
            </button>
            <button
              onClick={() => setFilter('enrolled')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                filter === 'enrolled'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('courses.myEnrollments') || 'My Enrollments'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'enrolled'
                ? t('courses.noEnrollments') || 'No enrollments yet'
                : t('courses.noCourses') || 'No courses available'}
            </h3>
            <p className="text-gray-600">
              {filter === 'enrolled'
                ? t('courses.startLearning') || 'Start learning by enrolling in a course'
                : t('courses.checkBack') || 'Check back later for new courses'}
            </p>
          </div>
        )}

        {/* Course Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnrollmentChange={handleEnrollmentChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
