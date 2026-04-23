'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import lmsClient from '@/lib/lmsClient';

interface CourseDetailProps {
  courseId: string;
}

export default function CourseDetail({ courseId }: CourseDetailProps) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await lmsClient.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        console.error('Failed to load course:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await lmsClient.enrollInCourse(courseId);
      setEnrolled(true);
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading course...</div>;
  }

  if (!course) {
    return <div className="text-center py-12 text-red-600">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
        <p className="text-gray-700 mb-6">{course.description}</p>

        {!enrolled ? (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : (
          <div className="text-green-600 font-semibold">Enrolled!</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Lessons</h2>
        {course.lessons && course.lessons.length > 0 ? (
          <div className="space-y-3">
            {course.lessons.map((lesson: any, index: number) => (
              <Link
                key={lesson.id}
                href={`/courses/${courseId}/lessons/${lesson.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Lesson {index + 1}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                  </div>
                  {lesson.duration && (
                    <span className="text-sm text-gray-500">{lesson.duration} min</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No lessons available yet.</p>
        )}
      </div>
    </div>
  );
}
