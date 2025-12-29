/**
 * Admin Roadmap Assignments Page
 * Allows admins/instructors to assign Google Docs roadmaps to students
 */

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Student {
  id: string;
  email: string;
  name: string | null;
  roadmapDocumentId: string | null;
}

export default function RoadmapAssignmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users?role=STUDENT');
      // Handle different response structures
      const studentsData = response.data.users || response.data.data?.users || [];
      setStudents(studentsData);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (studentId: string) => {
    if (!documentId.trim()) {
      alert('Please enter a valid Google Doc ID');
      return;
    }

    try {
      setSaving(true);
      await axios.put(`/api/admin/students/${studentId}/roadmap-document`, {
        roadmapDocumentId: documentId.trim(),
      });

      // Update local state
      setStudents(students.map(s => 
        s.id === studentId 
          ? { ...s, roadmapDocumentId: documentId.trim() } 
          : s
      ));

      setEditingStudent(null);
      setDocumentId('');
      alert('Roadmap document assigned successfully!');
    } catch (err: any) {
      console.error('Error assigning document:', err);
      alert(err.response?.data?.error || 'Failed to assign document');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (student: Student) => {
    setEditingStudent(student.id);
    setDocumentId(student.roadmapDocumentId || '');
  };

  const cancelEditing = () => {
    setEditingStudent(null);
    setDocumentId('');
  };

  const filteredStudents = students.filter(student =>
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Roadmap Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Assign personalized Google Docs roadmaps to students
          </p>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            How to Assign a Roadmap
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>Create a Google Doc with the student's personalized roadmap</li>
            <li>Share the document with the service account: <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-xs">toku-web-doc-reader@toku-web-doc-storage.iam.gserviceaccount.com</code></li>
            <li>Copy the document ID from the URL: <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-xs">https://docs.google.com/document/d/DOCUMENT_ID/edit</code></li>
            <li>Paste the document ID below and click "Assign"</li>
          </ol>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Roadmap Document ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.name || 'Unnamed'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingStudent === student.id ? (
                        <input
                          type="text"
                          value={documentId}
                          onChange={(e) => setDocumentId(e.target.value)}
                          placeholder="Enter Google Doc ID"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm">
                          {student.roadmapDocumentId ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {student.roadmapDocumentId}
                              </code>
                              <a
                                href={`https://docs.google.com/document/d/${student.roadmapDocumentId}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">Not assigned</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingStudent === student.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAssign(student.id)}
                            disabled={saving}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Assign'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(student)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {student.roadmapDocumentId ? 'Edit' : 'Assign'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          {students.length} total students • {students.filter(s => s.roadmapDocumentId).length} with roadmaps assigned
        </div>
      </div>
    </div>
  );
}
