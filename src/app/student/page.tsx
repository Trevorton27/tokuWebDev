'use client';

import { useUser } from '@clerk/nextjs';
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

export default function StudentDashboard() {
  const { user } = useUser();
  const { t } = useLanguage();

  // Track user session activity
  useSessionTracking();

  // Get user's first name, full name, or username
  const userName = user?.firstName || user?.fullName || user?.username || 'Student';

  // TODO: Fetch all dashboard data in parallel using Promise.all() or React Query
  // TODO: Add loading states for each section
  // TODO: Add error boundaries for graceful error handling
  // TODO: Implement real-time updates via WebSocket for notifications

  return (
    <OnboardingCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        {/* Header Section */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* RIGHT NOW Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Right Now
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Hero: Current Project - Spans 2 columns */}
            <div className="lg:col-span-2">
              <ProjectSummary />
            </div>

            {/* Upcoming Events - Prioritized */}
            <div>
              <CalendarEvents configPath="/student/calendar-config" />
            </div>
          </div>
        </section>

        {/* THIS WEEK Section */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            This Week
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
