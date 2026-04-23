'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import ProjectSummary from '@/modules/student/components/ProjectSummary';
import CourseRoadmap from '@/modules/student/components/CourseRoadmap';
import CalendarEvents from '@/components/calendar/CalendarEvents';
import StudyStreak from '@/modules/student/components/StudyStreak';
import RecommendedResources from '@/modules/student/components/RecommendedResources';
import Notifications from '@/modules/student/components/Notifications';
import QuickNav from '@/modules/student/components/QuickNav';
import OnboardingCheck from '@/modules/student/components/OnboardingCheck';
import ActivityOverview from '@/modules/student/components/ActivityOverview';
import GitHubActivity from '@/modules/student/components/GitHubActivity';
import StudentReviewStatus from '@/components/reviews/StudentReviewStatus';

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { t } = useLanguage();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Track user session activity
  useSessionTracking();

  useEffect(() => {
    async function checkAccess() {
      if (!isLoaded) return;

      if (!user) {
        router.push('/sign-in');
        return;
      }

      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.success || !data.user) {
          router.push('/sign-in');
          return;
        }

        if (data.user.role === 'ADMIN') {
          router.push('/admin');
          return;
        }

        if (data.user.role === 'INSTRUCTOR') {
          router.push('/instructor');
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.push('/');
      }
    }

    checkAccess();
  }, [user, isLoaded, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Get user's first name, full name, or username
  const userName = user?.firstName || user?.fullName || user?.username || 'Student';

  return (
    <OnboardingCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        {/* Header Section */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('student.welcome')}, {userName}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {t('student.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* RIGHT NOW Section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              {t('student.rightNow')}
            </h2>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Active Project */}
              <div>
                <ProjectSummary />
              </div>

              {/* Review Status */}
              <div>
                <StudentReviewStatus />
              </div>

              {/* Upcoming Events */}
              <div>
                <CalendarEvents configPath="/student/calendar-config" />
              </div>
            </div>
          </section>

          {/* THIS WEEK Section */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              {t('student.thisWeek')}
            </h2>
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Activity Overview - Simplified */}
              <div className="h-full">
                <ActivityOverview />
              </div>

              {/* GitHub Activity */}
              <div className="h-full">
                <GitHubActivity />
              </div>

              {/* Course Roadmap */}
              <div className="h-full">
                <CourseRoadmap />
              </div>
            </div>
          </section>

          {/* RESOURCES & PROGRESS Section - Aligned */}
          <section>
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* Recommended Resources - Left side, spans 2 columns */}
              <div className="lg:col-span-2">
                <RecommendedResources />
              </div>

              {/* Your Progress - Right side */}
              <div className="space-y-6">
                <StudyStreak />
                <Notifications />
              </div>
            </div>
          </section>

          {/* Quick Navigation */}
          <section>
            <QuickNav />
          </section>
        </div>

        {/* Motivational Footer */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-white text-lg font-semibold mb-2">
              {t('student.quote')}
            </p>
            <p className="text-indigo-200 text-sm">
              {t('student.quoteSubtext')}
            </p>
          </div>
        </div>
      </div>
    </OnboardingCheck>
  );
}
