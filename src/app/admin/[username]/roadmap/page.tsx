'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string | null;
  email: string;
}

export default function StudentRoadmap() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (username) {
      fetchStudent();
    }
  }, [username]);

  const fetchStudent = async () => {
    try {
      // Search for student by username (name field) or email prefix
      const searchParams = new URLSearchParams({ role: 'STUDENT', search: username });
      const res = await fetch(`/api/admin/users?${searchParams}`);
      const data = await res.json();

      if (data.success && data.data.users.length > 0) {
        // Find exact match by name or email prefix
        const matchedStudent = data.data.users.find((u: Student) =>
          u.name === username || u.email.startsWith(username)
        );

        if (matchedStudent) {
          setStudent(matchedStudent);
        } else {
          setStudent(data.data.users[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading student profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Unable to find student with username: {username}
            </p>
            <Link
              href="/admin/students"
              className="inline-block px-6 py-3 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow dark:shadow-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Learning Roadmap
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {student.name || username}
              </p>
            </div>
            <Link
              href="/admin/students"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`${
                activeTab === 'overview'
                  ? 'border-indigo-600 dark:border-purple-500 text-indigo-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`${
                activeTab === 'skills'
                  ? 'border-indigo-600 dark:border-purple-500 text-indigo-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Skills Progress
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`${
                activeTab === 'milestones'
                  ? 'border-indigo-600 dark:border-purple-500 text-indigo-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Milestones
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-dark-border">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Roadmap Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The personalized learning roadmap feature is currently under development.
          </p>
        </div>
      </div>
    </div>
  );
}
