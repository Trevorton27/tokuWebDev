'use client';

import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import Link from 'next/link';
import StudentActivityTable from '@/modules/instructor/components/StudentActivityTable';
import AtRiskAlerts from '@/modules/instructor/components/AtRiskAlerts';
import CalendarEvents from '@/components/calendar/CalendarEvents';
import ReviewQueue from '@/components/reviews/ReviewQueue';

export default function InstructorDashboard() {
  const { user } = useUser();
  const { t } = useLanguage();

  // Track user session activity
  useSessionTracking();

  const instructorName = user?.firstName || user?.fullName || user?.username || 'Instructor';

  // TODO: Fetch all dashboard data in parallel using Promise.all() or React Query
  // TODO: Add loading states for each section
  // TODO: Add error boundaries for graceful error handling
  // TODO: Implement real-time updates via WebSocket for activity feed

  // Placeholder data
  const cohortStats = {
    totalStudents: 24,
    activeStudents: 18,
    inactiveStudents: 6,
    atRiskStudents: 3,
  };

  const students = [
    { id: 1, name: 'Alice Johnson', avatar: '👩', progress: 85, currentModule: 'React Hooks', lastActive: '2 hours ago', status: 'On track' },
    { id: 2, name: 'Bob Smith', avatar: '👨', progress: 45, currentModule: 'JavaScript Basics', lastActive: '1 day ago', status: 'Behind' },
    { id: 3, name: 'Carol Davis', avatar: '👩', progress: 30, currentModule: 'HTML & CSS', lastActive: '5 days ago', status: 'At risk' },
  ];

  const activityFeed = [
    { id: 1, student: 'Trevor', action: 'submitted Project 1 for review', type: 'Project', time: '10 min ago' },
    { id: 2, student: 'Alice', action: 'completed Challenge #7', type: 'Challenge', time: '1 hour ago' },
    { id: 3, student: 'Bob', action: 'pushed new commits to GitHub', type: 'GitHub', time: '2 hours ago' },
  ];

  const reviewQueue = [
    { id: 1, student: 'Trevor Martinez', type: 'Project', item: 'E-commerce Dashboard', submitted: '2 hours ago' },
    { id: 2, student: 'Alice Johnson', type: 'Checkpoint', item: 'Module 3 - Checkpoint 2', submitted: '1 day ago' },
  ];

  const projects = [
    { id: 1, student: 'Trevor', project: 'E-commerce Dashboard', repo: 'https://github.com/user/project', lastCommit: '2 hours ago', status: 'Ready for review' },
    { id: 2, student: 'Alice', project: 'Todo App', repo: 'https://github.com/user/todo', lastCommit: '1 day ago', status: 'In progress' },
  ];

  const challengeStats = {
    mostFailed: ['Array Methods', 'Async/Await', 'Closures'],
    avgAttempts: 2.4,
    highHintUsage: ['Recursion', 'Binary Search', 'Dynamic Programming'],
  };

  const moduleDistribution = [
    { module: 'JavaScript Fundamentals', students: 8, completion: '3 days avg' },
    { module: 'React Basics', students: 10, completion: '5 days avg' },
    { module: 'Advanced Patterns', students: 6, completion: '7 days avg' },
  ];

  const questions = [
    { id: 1, student: 'Bob Smith', question: 'How do I handle async errors in...', topic: 'JavaScript', status: 'Unanswered' },
    { id: 2, student: 'Carol Davis', question: 'Best practices for state management...', topic: 'React', status: 'Waiting on student' },
  ];

  const schedule = [
    { id: 1, title: 'Office Hours', date: 'Today 3:00 PM', type: 'Office Hours' },
    { id: 2, title: 'Group Q&A Session', date: 'Tomorrow 2:00 PM', type: 'Group' },
  ];

  const announcements = [
    { id: 1, title: 'New Module Released', date: '2 days ago', cohort: 'Fall 2024' },
    { id: 2, title: 'Holiday Schedule Update', date: '1 week ago', cohort: 'All cohorts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('instructor.welcome')}, {instructorName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">{t('instructor.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. Cohort Overview / Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* TODO: Replace hardcoded numbers with real data from student_progress or enrollments table */}
          {/* TODO: Define "active" and "at-risk" rules (e.g. low progress + low activity) */}
          {/* TODO: Clicking a stat should filter the student list below */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="text-sm font-medium text-gray-600">{t('instructor.totalStudents')}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{cohortStats.totalStudents}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
            <div className="text-sm font-medium text-green-600">{t('instructor.activeStudents')}</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{cohortStats.activeStudents}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-yellow-100">
            <div className="text-sm font-medium text-yellow-600">{t('instructor.inactiveStudents')}</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{cohortStats.inactiveStudents}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border border-red-100">
            <div className="text-sm font-medium text-red-600">{t('instructor.atRiskStudents')}</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{cohortStats.atRiskStudents}</div>
          </div>
        </div>

        {/* Real-Time Activity Tracking */}
        <div className="mb-6">
          <StudentActivityTable />
        </div>

        {/* At-Risk Students Alerts */}
        <div className="mb-6">
          <AtRiskAlerts />
        </div>

        {/* Top Row: Student List + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2. Student List / Snapshot Cards */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('instructor.students')}</h2>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                {t('instructor.viewAll')}
              </button>
            </div>
            {/* TODO: Fetch list of students assigned to this instructor from the DB */}
            {/* TODO: Support filtering and sorting (by progress, last active, status) */}
            {/* TODO: Clicking a student opens a dedicated "Student Detail" page or side panel */}
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{student.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.currentModule}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${student.status === 'On track' ? 'bg-green-100 text-green-700' :
                      student.status === 'Behind' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {student.status === 'On track' ? t('instructor.onTrack') :
                        student.status === 'Behind' ? t('instructor.behind') :
                          t('instructor.atRisk')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{t('instructor.progress')}</span>
                      <span className="font-semibold">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('instructor.lastActive')}: {student.lastActive}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Recent Activity Feed */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('instructor.recentActivity')}</h2>
            {/* TODO: Merge activity from challenges, projects, and GitHub webhooks into a single feed */}
            {/* TODO: Fetch only recent activity for students in this instructor's cohort(s) */}
            {/* TODO: Enable basic filters (e.g. show only project submissions or only questions) */}
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'Project' ? 'bg-blue-500' :
                    activity.type === 'Challenge' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.student}</span> {activity.action}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">{activity.type}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Row: Review Queue + Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 4. Review / Grading Queue */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <ReviewQueue />
          </div>

          {/* 5. Project & GitHub Overview */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('instructor.projectsGithub')}</h2>
            {/* TODO: Connect to student_projects table containing repo URLs and status */}
            {/* TODO: Populate "last commit" from GitHub webhook logs stored in DB */}
            {/* TODO: Add filters for project status and module */}
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.project}</h3>
                      <p className="text-sm text-gray-600">{project.student}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      {project.status}
                    </span>
                  </div>
                  <a href={project.repo} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    {t('instructor.viewRepository')}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{t('instructor.lastCommit')}: {project.lastCommit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 6. Challenge Analytics */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('instructor.challengeAnalytics')}</h2>
            {/* TODO: Aggregate data from challenge_attempts table */}
            {/* TODO: Show per-course or per-cohort stats based on instructor context */}
            {/* TODO: Clicking a challenge opens a detailed analytics page for that challenge */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('instructor.mostFailed')}</h3>
                <div className="space-y-2">
                  {challengeStats.mostFailed.map((challenge, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-red-50 rounded px-3 py-2">
                      <span className="text-sm text-gray-900">{challenge}</span>
                      <span className="text-xs text-red-600 font-medium">{t('instructor.highFailureRate')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('instructor.avgAttempts')}</span>
                  <span className="text-2xl font-bold text-indigo-600">{challengeStats.avgAttempts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Module / Roadmap Insights */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('instructor.moduleDistribution')}</h2>
            {/* TODO: Calculate per-module distribution from student progress records */}
            {/* TODO: Mark modules as bottlenecks if students stay too long or have high failure rates */}
            {/* TODO: Add link to "Edit module content" for quick navigation */}
            <div className="space-y-3">
              {moduleDistribution.map((module, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{module.module}</h3>
                    <span className="text-sm text-indigo-600 font-medium">{module.students} {t('instructor.students')}</span>
                  </div>
                  <p className="text-xs text-gray-600">{t('instructor.avgCompletion')}: {module.completion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Questions + Schedule + Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 8. Questions & Support Center */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('instructor.questions')}</h2>
            {/* TODO: Fetch questions from questions or discussions table */}
            {/* TODO: Assign questions to specific instructors or TAs */}
            {/* TODO: Clicking a question opens full thread for answering */}
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${q.status === 'Unanswered' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {q.status === 'Unanswered' ? t('student.notStarted') : t('student.inProgress')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{q.student}</span>
                    <span className="text-xs text-gray-500">{q.topic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Schedule & Upcoming Sessions */}
          <CalendarEvents configPath="/instructor/calendar-config" />

          {/* 10. Announcements & Broadcast */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{t('instructor.announcements')}</h2>
              <button className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                {t('instructor.newAnnouncement')}
              </button>
            </div>
            {/* TODO: Save announcements to announcements table */}
            {/* TODO: Notify students via email + in-app notifications */}
            {/* TODO: Allow filtering by cohort/course */}
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-gray-50 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{announcement.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">{announcement.cohort}</span>
                    <span className="text-xs text-gray-500">{announcement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 11. AI Insights for Instructors */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">{t('instructor.aiInsights')}</h2>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">{t('instructor.refresh')}</button>
          </div>
          {/* TODO: Connect to AI microservice endpoint (e.g. /api/instructor-insights) */}
          {/* TODO: Pass anonymized aggregate stats and content metadata as context */}
          {/* TODO: Allow instructor to refresh / regenerate insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('instructor.topStrugglingTopics')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('student.resourceCategoryWeb')}</li>
                <li>• {t('student.resourceCategoryTS')}</li>
                <li>• React Hooks</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('instructor.atRiskStudentsInsight')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('instructor.behind')} - 3 students</li>
                <li>• Low engagement patterns detected</li>
                <li>• Recommend 1:1 check-ins</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('instructor.contentImprovements')}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add more examples to Module 3</li>
                <li>• Simplify Challenge #12 instructions</li>
                <li>• Create video walkthrough for Hooks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
