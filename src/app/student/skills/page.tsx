'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SkillRadar from '@/modules/assessment/ui/SkillRadar';

interface SkillDimensionData {
  dimension: string;
  label: string;
  mastery: number;
  confidence: number;
}

interface SkillProfileData {
  dimensions: SkillDimensionData[];
  overallMastery: number;
  overallConfidence: number;
  totalSkillsAssessed: number;
  totalSkills: number;
  lastAssessment?: string;
}

const getDimensionLabel = (t: any, key: string) => {
  const labels: Record<string, string> = {
    programming_fundamentals: t('student.dimProgramming'),
    web_foundations: t('student.dimWebFoundations'),
    javascript: t('student.dimJS'),
    backend: t('student.dimBackend'),
    dev_practices: t('student.dimDevPractices'),
    system_thinking: t('student.dimSystemThinking'),
    design: t('student.dimDesign'),
    meta: t('student.dimMeta'),
  };
  return labels[key] || key;
};

export default function SkillsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<SkillProfileData | null>(null);

  useEffect(() => {
    fetchSkillProfile();
  }, []);

  const fetchSkillProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/assessment/intake/summary');
      if (response.data.success) {
        const summary = response.data.data.profileSummary;
        // Transform the data
        const dimensions = summary.dimensions.map((d: any) => ({
          dimension: d.key,
          label: getDimensionLabel(t, d.key),
          mastery: d.score,
          confidence: d.confidence,
        }));

        setProfile({
          dimensions,
          overallMastery: summary.overallScore,
          overallConfidence: summary.overallConfidence,
          totalSkillsAssessed: summary.totalSkillsAssessed,
          totalSkills: summary.totalSkills,
        });
      } else {
        setError(response.data.error || t('student.failedToLoadSkillProfile'));
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(t('student.noSkillProfile'));
      } else {
        setError(t('student.failedToLoadSkillProfile'));
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('student.loadingSkillProfile')}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('student.noSkillProfile')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || t('student.completeAssessmentPrompt')}
            </p>
            <Link
              href="/assessment/intake"
              className="inline-block px-6 py-3 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-purple-700 transition"
            >
              {t('student.startAssessment')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getOverallLevelLabel = (mastery: number) => {
    if (mastery >= 0.7) return { label: t('student.advanced'), color: 'text-green-600 dark:text-green-400' };
    if (mastery >= 0.5) return { label: t('student.intermediate'), color: 'text-blue-600 dark:text-blue-400' };
    if (mastery >= 0.3) return { label: t('student.beginner'), color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: t('student.novice'), color: 'text-gray-600 dark:text-gray-400' };
  };

  const overallLevel = getOverallLevelLabel(profile.overallMastery);

  // Find strongest and weakest areas
  const sortedDimensions = [...profile.dimensions].sort((a, b) => b.mastery - a.mastery);
  const strongestAreas = sortedDimensions.slice(0, 2);
  const weakestAreas = sortedDimensions.slice(-2).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Link href="/student" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
              {t('common.back')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('student.yourSkillProfile')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t('student.skillProfileDesc')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-border">
            <div className={`text-3xl font-bold ${overallLevel.color}`}>
              {overallLevel.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('student.overallLevel')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {Math.round(profile.overallMastery * 100)}%
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-border">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {profile.totalSkillsAssessed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('student.skillsAssessed')}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('student.ofTotal', { count: profile.totalSkills })}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-border">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(profile.overallConfidence * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('student.confidence')}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('student.basedOnAssessmentData')}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-5 border border-gray-100 dark:border-dark-border">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {profile.dimensions.filter((d) => d.mastery >= 0.7).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('student.strongAreas')}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('student.masteryThreshold')}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <SkillRadar dimensions={profile.dimensions} showConfidence={true} height={350} />
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Strongest Areas */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>💪</span> {t('student.strongestAreas')}
              </h3>
              <div className="space-y-3">
                {strongestAreas.map((dim) => (
                  <div key={dim.dimension} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{dim.label}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{Math.round(dim.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas to Improve */}
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🎯</span> {t('student.focusAreas')}
              </h3>
              <div className="space-y-3">
                {weakestAreas.map((dim) => (
                  <div key={dim.dimension} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{dim.label}</span>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">{Math.round(dim.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
              <Link
                href="/student/roadmap"
                className="mt-4 block text-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
              >
                {t('student.viewLearningRoadmap')}
              </Link>
            </div>

            {/* Retake Assessment */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-purple-600 dark:to-indigo-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('student.updateProfile')}</h3>
              <p className="text-indigo-100 dark:text-purple-200 text-sm mb-4">
                {t('student.retakeAssessmentDesc')}
              </p>
              <Link
                href="/assessment/intake"
                className="block text-center px-4 py-2 bg-white text-indigo-600 dark:text-purple-600 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-gray-100 transition"
              >
                {t('student.retakeAssessment')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
