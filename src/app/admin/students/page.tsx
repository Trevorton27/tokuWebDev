'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student {
  id: string;
  email: string;
  name: string | null;
  role: string;
  adminNotes: string | null;
  createdAt: string;
  currentEnrollment: {
    id: string;
    courseTitle: string;
    startDate: string;
    finishDate: string | null;
    progress: number;
  } | null;
  assessmentLevel: string;
  _count: {
    enrollments: number;
    attempts: number;
  };
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateForm, setDateForm] = useState({
    startDate: '',
    finishDate: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ role: 'STUDENT' });
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.data.users);

        // Initialize notes state from fetched data
        const notesMap: { [key: string]: string } = {};
        data.data.users.forEach((student: Student) => {
          if (student.adminNotes) {
            notesMap[student.id] = student.adminNotes;
          }
        });
        setNotes(notesMap);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (studentId: string, note: string) => {
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: note }),
      });

      const data = await res.json();
      if (!data.success) {
        console.error('Failed to save notes:', data.error);
        alert('Failed to save notes: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleEditDates = (student: Student) => {
    setEditingStudent(student);
    setDateForm({
      startDate: formatDateForInput(student.currentEnrollment?.startDate || null),
      finishDate: formatDateForInput(student.currentEnrollment?.finishDate || null),
    });
    setShowEditModal(true);
  };

  const handleSaveDates = async () => {
    if (!editingStudent?.currentEnrollment?.id) return;

    try {
      const res = await fetch(`/api/admin/enrollments/${editingStudent.currentEnrollment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrolledAt: dateForm.startDate || null,
          completedAt: dateForm.finishDate || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingStudent(null);
        fetchStudents(); // Refresh the list
      } else {
        alert('Failed to update dates: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating dates:', error);
      alert('Failed to update dates');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow dark:shadow-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage student username and email in{' '}
                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                >
                  Clerk Account
                </a>
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-lg px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
          />
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-300">Loading students...</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card shadow-md rounded-lg overflow-hidden overflow-x-auto border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Enrolled Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Finish Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assessment Level
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assessment Results
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Roadmap
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No students found. Create users with role "STUDENT" in{' '}
                      <a
                        href="https://dashboard.clerk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                      >
                        Clerk Dashboard
                      </a>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {student.currentEnrollment?.courseTitle || (
                            <span className="text-gray-400 dark:text-gray-500">Not enrolled</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(student.currentEnrollment?.startDate || null)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(student.currentEnrollment?.finishDate || null)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.assessmentLevel === 'Advanced'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                              : student.assessmentLevel === 'Intermediate'
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {student.assessmentLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/${student.name || student.email.split('@')[0]}/assessments`}
                          className="inline-flex items-center px-2 py-1 border border-purple-300 dark:border-purple-700 rounded-md text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-xs"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                          View
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/${student.name || student.email.split('@')[0]}/roadmap`}
                          className="inline-flex items-center px-2 py-1 border border-blue-300 dark:border-blue-700 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                          View
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Add notes..."
                          value={notes[student.id] || ''}
                          onChange={(e) =>
                            setNotes({ ...notes, [student.id]: e.target.value })
                          }
                          onBlur={(e) => handleSaveNotes(student.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEditDates(student)}
                          disabled={!student.currentEnrollment}
                          className={`inline-flex items-center px-2 py-1 border rounded-md text-xs transition-colors ${
                            student.currentEnrollment
                              ? 'border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                              : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Edit Dates
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dates Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit Enrollment Dates</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Editing dates for <span className="font-semibold">{editingStudent.name}</span>
              {editingStudent.currentEnrollment && (
                <span> enrolled in <span className="font-semibold">{editingStudent.currentEnrollment.courseTitle}</span></span>
              )}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateForm.startDate}
                  onChange={(e) => setDateForm({ ...dateForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Finish Date
                </label>
                <input
                  type="date"
                  value={dateForm.finishDate}
                  onChange={(e) => setDateForm({ ...dateForm, finishDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty if not completed</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDates}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
