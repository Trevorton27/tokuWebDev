'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface RoadmapDocument {
  success: boolean;
  title: string;
  content: string;
  documentId: string;
  lastModified: string;
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDocument | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/roadmap/document');

      if (response.data.success) {
        setRoadmap(response.data);
      } else {
        setError(response.data.error || 'Failed to load roadmap');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No roadmap assigned yet. Please contact your instructor.');
      } else {
        setError('Failed to load roadmap. Please try again later.');
      }
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Roadmap Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchRoadmap}
                className="px-6 py-3 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
              >
                Try Again
              </button>
              <Link
                href="/student"
                className="px-6 py-3 bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-dark-hover transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display roadmap content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {roadmap?.title || 'Your Learning Roadmap'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Your personalized curriculum guide
              </p>
            </div>
            <Link
              href="/student"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-hover transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-8">
            {/* Render the Google Docs HTML content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: roadmap?.content || '' }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This roadmap is managed by your instructor. If you have questions, please reach out to them.
          </p>
        </div>
      </div>
    </div>
  );
}
