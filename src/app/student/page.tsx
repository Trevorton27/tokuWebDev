'use client';

import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import CurrentFocus from '@/modules/student/components/CurrentFocus';
import RoadmapProgress from '@/modules/student/components/RoadmapProgress';
import ActiveChallenges from '@/modules/student/components/ActiveChallenges';
import ProjectSummary from '@/modules/student/components/ProjectSummary';
import CalendarEvents from '@/modules/student/components/CalendarEvents';
import StudyStreak from '@/modules/student/components/StudyStreak';
import AIRecommendations from '@/modules/student/components/AIRecommendations';
import Notifications from '@/modules/student/components/Notifications';
import QuickNav from '@/modules/student/components/QuickNav';
import MyCourses from '@/modules/student/components/MyCourses';
import OnboardingCheck from '@/modules/student/components/OnboardingCheck';
import LoginSessionHistory from '@/modules/student/components/LoginSessionHistory';
import GitHubActivity from '@/modules/student/components/GitHubActivity';
import EngagementMetrics from '@/modules/student/components/EngagementMetrics';

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('student.welcome')}, {userName}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {t('student.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('student.lastActive')}: <span className="font-medium text-gray-900 dark:text-white">{t('student.todayAt')} 2:30 PM</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Row: Current Focus & Progress */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <CurrentFocus />
          <RoadmapProgress />
        </div>

        {/* Second Row: My Courses */}
        <div className="mb-6">
          <MyCourses />
        </div>

        {/* Activity Tracking Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <LoginSessionHistory />
          <GitHubActivity />
          <EngagementMetrics />
        </div>

        {/* Third Row: Active Tasks & Project */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ActiveChallenges />
          <ProjectSummary />
        </div>

        {/* Fourth Row: 3-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <StudyStreak />
          <CalendarEvents />
          <Notifications />
        </div>

        {/* Fifth Row: AI Recommendations */}
        <div className="mb-6">
          <AIRecommendations />
        </div>

        {/* Bottom Row: Quick Navigation */}
        <div>
          <QuickNav />
        </div>
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
