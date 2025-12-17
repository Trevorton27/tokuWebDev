'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import axios from 'axios';
import type { RoadmapStatus } from '@prisma/client';

interface RoadmapItem {
  id: string;
  resourceId: string;
  title: string;
  description: string;
  type: string;
  status: RoadmapStatus;
  order: number;
  phase: number;
  skillKeys: string[];
  difficulty: number;
  estimatedHours: number;
}

interface RoadmapSummary {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  totalHours: number;
  completedHours: number;
}

interface PhaseConfig {
  phase: number;
  title: string;
  description: string;
  focusAreas: string[];
  estimatedWeeks: number;
}

const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 1,
    title: 'Foundations',
    description: 'Build a solid foundation in programming concepts and web basics',
    focusAreas: ['Programming Fundamentals', 'HTML & CSS', 'Git Basics'],
    estimatedWeeks: 4,
  },
  {
    phase: 2,
    title: 'Dynamic Web Development',
    description: 'Master JavaScript and create interactive web applications',
    focusAreas: ['JavaScript', 'DOM Manipulation', 'APIs & Async'],
    estimatedWeeks: 6,
  },
  {
    phase: 3,
    title: 'Full-Stack Development',
    description: 'Build complete applications with frontend, backend, and database',
    focusAreas: ['React/Next.js', 'Node.js', 'Databases', 'Deployment'],
    estimatedWeeks: 6,
  },
];

export default function RoadmapPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [byPhase, setByPhase] = useState<Record<number, RoadmapItem[]>>({});
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3]));
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/roadmap?summary=true');
      if (response.data.success) {
        setItems(response.data.data.items);
        setByPhase(response.data.data.byPhase);
        setSummary(response.data.data.summary);
      } else {
        setError(response.data.error || 'Failed to load roadmap');
      }
    } catch (err) {
      setError('Failed to load roadmap');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = useCallback(async (itemId: string, status: RoadmapStatus) => {
    setUpdatingItem(itemId);
    try {
      const response = await axios.patch('/api/roadmap', { itemId, status });
      if (response.data.success) {
        // Update local state
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status } : item))
        );
        setByPhase((prev) => {
          const updated = { ...prev };
          for (const phase in updated) {
            updated[phase] = updated[phase].map((item) =>
              item.id === itemId ? { ...item, status } : item
            );
          }
          return updated;
        });
        // Refresh summary
        fetchRoadmap();
      }
    } catch (err) {
      console.error('Failed to update item status', err);
    } finally {
      setUpdatingItem(null);
    }
  }, []);

  const togglePhase = (phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'READING':
        return '📚';
      case 'EXERCISE':
        return '💪';
      case 'PROJECT':
        return '🏗️';
      case 'MILESTONE':
        return '🏆';
      case 'VIDEO':
        return '🎬';
      case 'QUIZ':
        return '❓';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: RoadmapStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BLOCKED':
        return 'bg-red-100 text-red-500 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPhaseProgress = (phase: number) => {
    const phaseItems = byPhase[phase] || [];
    if (phaseItems.length === 0) return 0;
    const completed = phaseItems.filter((i) => i.status === 'COMPLETED').length;
    return Math.round((completed / phaseItems.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load roadmap</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={fetchRoadmap}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
            <Link
              href="/assessment/intake"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Roadmap Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete the skill assessment to get your personalized learning roadmap.
            </p>
            <Link
              href="/assessment/intake"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const overallProgress = summary
    ? Math.round((summary.completedItems / summary.totalItems) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/student"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Your Learning Roadmap</h1>
              </div>
              <p className="text-gray-600 mt-1">
                Your personalized path to becoming a full-stack developer
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-3xl font-bold text-green-600">{summary.completedItems}</div>
              <div className="text-sm text-gray-600">Completed Items</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">{summary.inProgressItems}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(summary.totalHours - summary.completedHours)}h
              </div>
              <div className="text-sm text-gray-600">Remaining Hours</div>
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="space-y-6">
          {PHASE_CONFIGS.map((phaseConfig) => {
            const phaseItems = byPhase[phaseConfig.phase] || [];
            const isExpanded = expandedPhases.has(phaseConfig.phase);
            const progress = getPhaseProgress(phaseConfig.phase);

            return (
              <div key={phaseConfig.phase} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => togglePhase(phaseConfig.phase)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-indigo-500' : 'bg-gray-400'
                    }`}>
                      {phaseConfig.phase}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{phaseConfig.title}</h3>
                      <p className="text-gray-600 text-sm">{phaseConfig.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {phaseConfig.focusAreas.map((area) => (
                          <span key={area} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{progress}%</div>
                      <div className="text-sm text-gray-500">{phaseItems.length} items</div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && phaseItems.length > 0 && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="space-y-3">
                      {phaseItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${getStatusColor(item.status)}`}
                        >
                          <div className="text-2xl">{getTypeIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">{item.title}</span>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                {item.estimatedHours}h
                              </span>
                              {item.difficulty && (
                                <span className="text-xs">
                                  {'⭐'.repeat(item.difficulty)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'NOT_STARTED' && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'IN_PROGRESS')}
                                disabled={updatingItem === item.id}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {updatingItem === item.id ? '...' : 'Start'}
                              </button>
                            )}
                            {item.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'COMPLETED')}
                                disabled={updatingItem === item.id}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                              >
                                {updatingItem === item.id ? '...' : 'Complete'}
                              </button>
                            )}
                            {item.status === 'COMPLETED' && (
                              <span className="text-green-600 font-medium">✓ Done</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && phaseItems.length === 0 && (
                  <div className="border-t border-gray-100 p-8 text-center text-gray-500">
                    No items in this phase yet
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Generate Roadmap CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Want a fresh roadmap?</h3>
          <p className="text-indigo-100 mb-4">
            Retake the assessment or regenerate your roadmap based on your updated skills.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/assessment/intake"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
            >
              Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
