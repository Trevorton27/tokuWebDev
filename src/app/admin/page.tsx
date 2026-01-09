'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import ReviewQueue from '@/components/reviews/ReviewQueue';
import {
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  UserPlus,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Calendar,
  Layers,
  PieChart,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

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
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Track user session activity
  useSessionTracking();

  // Check if user has admin role from database
  useEffect(() => {
    async function checkAdminAccess() {
      if (!isLoaded) return;

      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        // Get current user from API which checks database role
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        console.log('Admin access check response:', data);
        if (!data.success || !data.user) {
          router.push('/sign-in');
          return;
        }

        // Check if user has ADMIN role from database
        if (data.user.role !== 'ADMIN') {
          console.log('Access denied - user role is:', data.user.role);
          // Redirect based on their actual role
          if (data.user.role === 'STUDENT') {
            router.push('/student');
          } else if (data.user.role === 'INSTRUCTOR') {
            router.push('/instructor');
          } else {
            router.push('/');
          }
          return;
        }

        setCheckingAuth(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/');
      }
    }

    checkAdminAccess();
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!checkingAuth) {
      fetchDashboardStats();
    }
  }, [checkingAuth]);

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

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-dark-border relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <div className="flex items-center justify-between">
        <div className="relative z-10">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-dark-surface text-gray-400 group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const ManagementCard = ({ title, description, href, icon: Icon, color }: any) => (
    <Link href={href}>
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-dark-border group h-full flex flex-col justify-between">
        <div>
          <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br ${color} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{description}</p>
        </div>
        <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <ArrowRight size={14} className="ml-1" />
        </div>
      </div>
    </Link>
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Checking access...</div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your learning platform</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</div>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats?.users.total || 0}
                  subtitle={`${stats?.users.students || 0} students, ${stats?.users.instructors || 0} instructors`}
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Total Courses"
                  value={stats?.courses.total || 0}
                  subtitle={`${stats?.courses.published || 0} published, ${stats?.courses.draft || 0} draft`}
                  icon={BookOpen}
                  color="bg-emerald-500"
                />
                <StatCard
                  title="Active Enrollments"
                  value={stats?.engagement.activeEnrollments || 0}
                  subtitle={`${stats?.engagement.completedCourses || 0} completed`}
                  icon={GraduationCap}
                  color="bg-indigo-500"
                />
                <StatCard
                  title="Avg Progress"
                  value={`${stats?.engagement.avgProgress || 0}%`}
                  subtitle={`${stats?.engagement.totalAttempts || 0} total attempts`}
                  icon={TrendingUp}
                  color="bg-orange-500"
                />
              </div>
            </div>

            {/* Code Review Queue */}
            <div className="mb-8">
              <ReviewQueue />
            </div>

            {/* Management Sections */}
            <div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ManagementCard
                  title="Student Management"
                  description="View, create, edit, and manage student accounts and their progress"
                  href="/admin/students"
                  icon={Users}
                  color="from-blue-500 to-blue-600"
                />
                <ManagementCard
                  title="Instructor Management"
                  description="Manage instructor accounts and their course assignments"
                  href="/admin/instructors"
                  icon={ShieldCheck}
                  color="from-indigo-500 to-indigo-600"
                />
                <ManagementCard
                  title="Course Management"
                  description="Manage all courses, publish/unpublish, and view enrollment stats"
                  href="/admin/courses"
                  icon={BookOpen}
                  color="from-emerald-500 to-emerald-600"
                />
                <ManagementCard
                  title="Lesson Management"
                  description="Create, edit, and organize lessons across all courses"
                  href="/admin/lessons"
                  icon={ClipboardList}
                  color="from-amber-500 to-amber-600"
                />
                <ManagementCard
                  title="Engagement Analytics"
                  description="Track student progress, completion rates, and assessment performance"
                  href="/admin/analytics"
                  icon={PieChart}
                  color="from-purple-500 to-purple-600"
                />
                <ManagementCard
                  title="Calendar Events"
                  description="View and manage event list with Google Calendar sync"
                  href="/admin/calendar"
                  icon={Calendar}
                  color="from-teal-500 to-teal-600"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admin/students?action=create"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <Users size={18} />
                  Add Student
                </Link>
                <Link
                  href="/admin/instructors?action=create"
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus size={18} />
                  Add Instructor
                </Link>
                <Link
                  href="/admin/courses?action=create"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <BookOpen size={18} />
                  Create Course
                </Link>
                <Link
                  href="/admin/calendar"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-dark-hover transform hover:-translate-y-0.5 transition-all border border-gray-200 dark:border-dark-border"
                >
                  <Calendar size={18} />
                  Manage Calendar
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
