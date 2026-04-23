'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFull: boolean;
  onEnrollmentChange?: () => void;
}

export default function EnrollButton({
  courseId,
  isEnrolled: initialIsEnrolled,
  isFull,
  onEnrollmentChange
}: EnrollButtonProps) {
  const { t } = useLanguage();
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lms/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEnrolled(true);
        onEnrollmentChange?.();
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm(t('courses.confirmUnenroll') || 'Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/lms/enrollments/unenroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEnrolled(false);
        onEnrollmentChange?.();
      } else {
        alert(data.error || 'Failed to unenroll');
      }
    } catch (error) {
      console.error('Unenrollment failed:', error);
      alert('Failed to unenroll from course');
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <button
        onClick={handleUnenroll}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('courses.loading') || 'Loading...' : t('courses.unenroll') || 'Unenroll'}
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
      >
        {t('courses.full') || 'Full'}
      </button>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? t('courses.enrolling') || 'Enrolling...' : t('courses.enroll') || 'Enroll'}
    </button>
  );
}
