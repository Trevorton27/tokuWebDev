'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Overview {
  student: {
    dbId: string;
    clerkId: string;
    name: string | null;
    email: string;
    role: string;
    adminNotes: string | null;
    roadmapDocumentId: string | null;
  };
  enrollment: {
    id: string;
    courseTitle: string;
    startDate: string;
    finishDate: string | null;
    progress: number;
  } | null;
  sessions: {
    assessmentNumber: number;
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    responseCount: number;
    averageScore: number;
  }[];
  roadmap: {
    id: string;
    title: string;
    itemType: string;
    status: string;
    phase: number;
    estimatedHours: number;
  }[];
  skills: {
    skillKey: string;
    mastery: number;
    confidence: number;
    attempts: number;
  }[];
}

export default function AdminStudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/students/${studentId}/overview`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOverview(data.data);
          setNotes(data.data.student.adminNotes || '');
        }
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleSaveNotes = async () => {
    if (!overview) return;
    setSavingNotes(true);
    await fetch(`/api/admin/users/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes: notes }),
    });
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-purple-500" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Student not found.</p>
          <button onClick={() => router.back()} className="text-indigo-600 dark:text-purple-400 hover:underline text-sm">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { student, enrollment, sessions, roadmap, skills } = overview;
  const displayName = student.name || student.email;
  const completedRoadmap = roadmap.filter((r) => r.status === 'COMPLETED').length;
  const topSkills = skills.slice(0, 8);
  const username = encodeURIComponent(student.name || student.email.split('@')[0]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/students"
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover transition"
              >
                All Students
              </Link>
              <Link
                href={`/admin/${username}/assessments`}
                className="px-3 py-1.5 text-sm text-white bg-indigo-600 dark:bg-purple-600 rounded-md hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
              >
                Assessment Results
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Enrolled Course', value: enrollment?.courseTitle || 'Not enrolled' },
            { label: 'Progress', value: enrollment ? `${enrollment.progress}%` : '—' },
            { label: 'Assessments', value: sessions.length > 0 ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''}` : 'None' },
            { label: 'Roadmap', value: roadmap.length > 0 ? `${completedRoadmap} / ${roadmap.length} done` : 'Not generated' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollment */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Enrollment</h2>
              {enrollment ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Course</span>
                    <span className="font-medium text-gray-900 dark:text-white">{enrollment.courseTitle}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Start</span>
                    <span className="text-gray-900 dark:text-white">{new Date(enrollment.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Finish</span>
                    <span className="text-gray-900 dark:text-white">
                      {enrollment.finishDate ? new Date(enrollment.finishDate).toLocaleDateString() : 'In progress'}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-surface rounded-full h-2">
                      <div
                        className="bg-indigo-600 dark:bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Not enrolled in any course.</p>
              )}
            </div>

            {/* Assessment Sessions */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Assessment Sessions</h2>
                <Link href={`/admin/${username}/assessments`} className="text-sm text-indigo-600 dark:text-purple-400 hover:underline">
                  View all →
                </Link>
              </div>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No assessment sessions yet.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Session #{s.assessmentNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {s.completedAt ? new Date(s.completedAt).toLocaleDateString() : 'In progress'} · {s.responseCount} responses
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${s.averageScore >= 70 ? 'text-green-600 dark:text-green-400' : s.averageScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                          {s.averageScore}%
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                          {s.status === 'COMPLETED' ? 'Done' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roadmap */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Learning Roadmap
                {roadmap.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                    {completedRoadmap}/{roadmap.length} complete
                  </span>
                )}
              </h2>
              {roadmap.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No roadmap generated yet.</p>
              ) : (
                <div className="space-y-2">
                  {roadmap.slice(0, 7).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'COMPLETED' ? 'bg-green-500' : item.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phase {item.phase} · {item.itemType} · ~{item.estimatedHours}h</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap capitalize">
                        {item.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  {roadmap.length > 7 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">+{roadmap.length - 7} more items</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {/* Skill Profile */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Top Skills</h2>
              {topSkills.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No skill data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topSkills.map((skill) => (
                    <div key={skill.skillKey}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300 truncate capitalize">
                          {skill.skillKey.replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium ml-2">{Math.round(skill.mastery * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-dark-surface rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 dark:bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${skill.mastery * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roadmap Document */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Roadmap Document</h2>
              {student.roadmapDocumentId ? (
                <a
                  href={`https://docs.google.com/document/d/${student.roadmapDocumentId}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition w-full justify-center"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Google Doc
                </a>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No document assigned. Configure it from the students table.</p>
              )}
            </div>

            {/* Admin Notes */}
            <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Admin Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Add notes about this student..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (student.adminNotes || '')}
                className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-purple-600 rounded-lg hover:bg-indigo-700 dark:hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {notesSaved ? 'Saved!' : savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
