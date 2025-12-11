'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  duration?: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  published: boolean;
}

interface CourseEditorProps {
  courseId: string;
}

export default function CourseEditor({ courseId }: CourseEditorProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonSuccessMessage, setLessonSuccessMessage] = useState('');
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: '',
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        fetch(`/api/lms/courses/${courseId}`),
        fetch(`/api/lms/courses/${courseId}/lessons`),
      ]);

      const courseData = await courseRes.json();
      const lessonsData = await lessonsRes.json();

      if (courseData.success) setCourse(courseData.data);
      if (lessonsData.success) setLessons(lessonsData.data);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({ title: '', content: '', videoUrl: '', duration: '' });
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration?.toString() || '',
    });
    setShowLessonForm(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    setSavingLesson(true);
    setLessonSuccessMessage('');

    try {
      const payload = {
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl || undefined,
        duration: lessonForm.duration ? parseInt(lessonForm.duration) : undefined,
        order: editingLesson ? editingLesson.order : lessons.length + 1,
      };

      const url = editingLesson
        ? `/api/lms/lessons/${editingLesson.id}`
        : `/api/lms/courses/${courseId}/lessons`;

      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = editingLesson
          ? 'Lesson successfully updated!'
          : 'Lesson successfully created!';
        setLessonSuccessMessage(successMessage);

        await fetchCourseData();

        // Clear form and hide after a brief delay to show success message
        setTimeout(() => {
          setShowLessonForm(false);
          setLessonForm({ title: '', content: '', videoUrl: '', duration: '' });
          setLessonSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save lesson:', error);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      const response = await fetch(`/api/lms/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchCourseData();
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const handlePublishToggle = async () => {
    try {
      const response = await fetch(`/api/lms/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !course?.published }),
      });

      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-2">Course not found</div>
        <div className="text-gray-600 text-sm">
          If you just navigated here, the database might be waking up. Please refresh the page in a few seconds.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-indigo-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 rounded-md transition ${
                course.published
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {course.published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Lessons ({lessons.length})
          </h2>
          <button
            onClick={handleAddLesson}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            + Add Lesson
          </button>
        </div>

        {/* Lesson Form */}
        {showLessonForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLesson ? 'Edit Lesson' : 'New Lesson'}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Lesson title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Lesson content (supports markdown)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes, optional)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="30"
                  />
                </div>
              </div>

              {lessonSuccessMessage && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-800 text-sm">
                  {lessonSuccessMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingLesson
                    ? (editingLesson ? 'Updating lesson...' : 'Creating lesson...')
                    : (editingLesson ? 'Update Lesson' : 'Create Lesson')
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  disabled={savingLesson}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No lessons yet. Click "Add Lesson" to create your first lesson.
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {lesson.content.substring(0, 100)}...
                    </p>
                  </div>
                  {lesson.duration && (
                    <span className="text-sm text-gray-500">{lesson.duration} min</span>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
