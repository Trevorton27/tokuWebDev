'use client';

import { useEffect, useState } from 'react';

interface Course {
  id: string;
  title: string;
  published: boolean;
  instructor: {
    name: string | null;
  };
}

interface AssignCourseModalProps {
  instructorId: string;
  instructorName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignCourseModal({
  instructorId,
  instructorName,
  isOpen,
  onClose,
  onSuccess,
}: AssignCourseModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/courses?limit=1000');
      const data = await res.json();

      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCourseId) {
      alert('Please select a course');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/courses/${selectedCourseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
        setSelectedCourseId('');
      } else {
        alert('Failed to assign course: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      alert('Failed to assign course');
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Course</h2>
        <p className="text-sm text-gray-600 mb-6">
          Assign a course to instructor: <span className="font-semibold">{instructorName}</span>
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-600">Loading courses...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} {!course.published && '(Draft)'}
                    {course.instructor.name && ` - Currently: ${course.instructor.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Assigning this course will transfer ownership from the
                current instructor (if any) to {instructorName}.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={saving || !selectedCourseId}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Assigning...' : 'Assign Course'}
          </button>
        </div>
      </div>
    </div>
  );
}
