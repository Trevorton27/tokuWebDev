/**
 * Student Curriculum Page
 * Displays the student curriculum roadmap from Google Docs
 * - Read-only for students
 * - Edit link for admins
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import Link from 'next/link';

interface RoadmapData {
  success: boolean;
  title: string;
  content: string;
  documentId: string;
  lastModified: string;
}

export default function CurriculumPage() {
  const { user, isLoaded } = useUser();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noDocumentAssigned, setNoDocumentAssigned] = useState(false);

  const isAdmin = user?.publicMetadata?.role === 'ADMIN';
  const editUrl = roadmap?.documentId
    ? `https://docs.google.com/document/d/${roadmap.documentId}/edit`
    : null;

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        setLoading(true);
        setNoDocumentAssigned(false);
        const response = await axios.get<RoadmapData>('/api/roadmap/document');
        setRoadmap(response.data);
      } catch (err: any) {
        console.error('Error fetching curriculum:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load curriculum';

        if (errorMessage === 'No roadmap document assigned') {
          setNoDocumentAssigned(true);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchRoadmap();
    }
  }, [isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-8 border border-gray-200 dark:border-dark-border">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No document assigned state
  if (noDocumentAssigned) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/student" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-12 border border-gray-200 dark:border-dark-border">
            <div className="text-center">
              <svg className="w-20 h-20 text-indigo-500 dark:text-indigo-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Roadmap Document Assigned
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Your instructor hasn't assigned a personalized curriculum roadmap to your account yet.
                Please contact your instructor to have one assigned.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/student" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Go to Dashboard
                </Link>
                <Link href="/student/roadmap" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  View Interactive Roadmap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-8 border border-gray-200 dark:border-dark-border">
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Curriculum</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <Link href="/student" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {roadmap?.title || 'Curriculum Roadmap'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Your personalized learning path and curriculum guide</p>
          </div>
          {isAdmin && editUrl && (
            <a href={editUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit in Google Docs
            </a>
          )}
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-8 lg:p-12">
            {!isAdmin && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Your Learning Roadmap</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This document outlines your curriculum and learning objectives. Track your progress and refer back as you advance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white" dangerouslySetInnerHTML={{ __html: roadmap?.content || '' }} />
          </div>

          <div className="bg-gray-50 dark:bg-dark-surface px-8 py-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
              {isAdmin && <p className="text-xs text-gray-400 dark:text-gray-500">Document ID: {roadmap?.documentId}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link href="/student" className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View your progress</p>
              </div>
            </div>
          </Link>

          <Link href="/student/roadmap" className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Roadmap</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track progress by task</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
