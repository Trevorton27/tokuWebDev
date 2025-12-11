'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  users: {
    total: number;
    students: number;
    instructors: number;
    admins: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  engagement: {
    activeEnrollments: number;
    completedCourses: number;
    avgProgress: number;
    totalAttempts: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersRes = await fetch('/api/admin/users?limit=1000');
      const usersData = await usersRes.json();

      // Fetch courses
      const coursesRes = await fetch('/api/admin/courses?limit=1000');
      const coursesData = await coursesRes.json();

      // Fetch engagement
      const engagementRes = await fetch('/api/admin/engagement');
      const engagementData = await engagementRes.json();

      if (usersData.success && coursesData.success && engagementData.success) {
        const users = usersData.data.users;
        const courses = coursesData.data.courses;
        const engagement = engagementData.data.summary;

        setStats({
          users: {
            total: users.length,
            students: users.filter((u: any) => u.role === 'STUDENT').length,
            instructors: users.filter((u: any) => u.role === 'INSTRUCTOR').length,
            admins: users.filter((u: any) => u.role === 'ADMIN').length,
          },
          courses: {
            total: courses.length,
            published: courses.filter((c: any) => c.published).length,
            draft: courses.filter((c: any) => !c.published).length,
          },
          engagement: {
            activeEnrollments: engagement.enrollments.inProgress,
            completedCourses: engagement.enrollments.completed,
            avgProgress: engagement.enrollments.avgProgress,
            totalAttempts: engagement.assessments.totalAttempts,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  const ManagementCard = ({ title, description, href, icon, color }: any) => (
    <Link href={href}>
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-t-4 ${color}`}>
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your learning platform</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats?.users.total || 0}
                  subtitle={`${stats?.users.students || 0} students, ${stats?.users.instructors || 0} instructors`}
                  icon="👥"
                  color="border-blue-500"
                />
                <StatCard
                  title="Total Courses"
                  value={stats?.courses.total || 0}
                  subtitle={`${stats?.courses.published || 0} published, ${stats?.courses.draft || 0} draft`}
                  icon="📚"
                  color="border-green-500"
                />
                <StatCard
                  title="Active Enrollments"
                  value={stats?.engagement.activeEnrollments || 0}
                  subtitle={`${stats?.engagement.completedCourses || 0} completed`}
                  icon="🎓"
                  color="border-purple-500"
                />
                <StatCard
                  title="Avg Progress"
                  value={`${stats?.engagement.avgProgress || 0}%`}
                  subtitle={`${stats?.engagement.totalAttempts || 0} total attempts`}
                  icon="📊"
                  color="border-orange-500"
                />
              </div>
            </div>

            {/* Management Sections */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ManagementCard
                  title="Student Management"
                  description="View, create, edit, and manage student accounts and their progress"
                  href="/admin/students"
                  icon="👨‍🎓"
                  color="border-blue-500"
                />
                <ManagementCard
                  title="Instructor Management"
                  description="Manage instructor accounts and their course assignments"
                  href="/admin/instructors"
                  icon="👨‍🏫"
                  color="border-indigo-500"
                />
                <ManagementCard
                  title="Course Management"
                  description="Manage all courses, publish/unpublish, and view enrollment stats"
                  href="/admin/courses"
                  icon="📚"
                  color="border-green-500"
                />
                <ManagementCard
                  title="Lesson Management"
                  description="Create, edit, and organize lessons across all courses"
                  href="/admin/lessons"
                  icon="📝"
                  color="border-yellow-500"
                />
                <ManagementCard
                  title="Student Engagement"
                  description="Track student progress, completion rates, and assessment performance"
                  href="/admin/engagement"
                  icon="📊"
                  color="border-purple-500"
                />
                <ManagementCard
                  title="Student Roadmaps"
                  description="Create and manage personalized learning paths for students"
                  href="/admin/roadmaps"
                  icon="🗺️"
                  color="border-pink-500"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/students?action=create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Add Student
                </Link>
                <Link
                  href="/admin/instructors?action=create"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  + Add Instructor
                </Link>
                <Link
                  href="/admin/courses?action=create"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  + Create Course
                </Link>
                <Link
                  href="/admin/roadmaps?action=create"
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                >
                  + Create Roadmap
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
