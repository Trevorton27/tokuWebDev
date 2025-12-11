'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EnrollButton from './EnrollButton';
import CourseDetailsModal from './CourseDetailsModal';

interface CourseCardProps {
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
      enrollments: number;
    };
    isEnrolled: boolean;
    isFull: boolean;
    availableSlots: number | null;
    maxStudents: number | null;
  };
  onEnrollmentChange?: () => void;
}

export default function CourseCard({ course, onEnrollmentChange }: CourseCardProps) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-100">
        {/* Thumbnail */}
        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-6xl">
              📚
            </div>
          )}
          {course.isEnrolled && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {t('courses.enrolled') || 'Enrolled'}
            </div>
          )}
          {course.isFull && !course.isEnrolled && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {t('courses.full') || 'Full'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {course.instructor.name || 'Unknown Instructor'}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {course._count.lessons} {t('courses.lessons') || 'lessons'}
            </div>

            {course.maxStudents && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {course.availableSlots !== null ? course.availableSlots : course.maxStudents} {t('courses.spotsLeft') || 'spots left'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition text-center"
            >
              {t('courses.viewDetails') || 'View Details'}
            </button>

            <EnrollButton
              courseId={course.id}
              isEnrolled={course.isEnrolled}
              isFull={course.isFull}
              onEnrollmentChange={onEnrollmentChange}
            />
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      <CourseDetailsModal
        courseId={course.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnrollmentChange={onEnrollmentChange}
      />
    </>
  );
}
