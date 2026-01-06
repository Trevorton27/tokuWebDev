'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { getAssessmentSummary, type AssessmentSummary } from '@/lib/intakeClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  sessionId: string;
  onComplete: () => void;
}

export default function SummaryStep({ sessionId, onComplete }: Props) {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedProject, setGeneratedProject] = useState<any>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaryAndGenerateRoadmap = async () => {
      try {
        // Fetch the assessment summary
        const data = await getAssessmentSummary();
        setSummary(data);
        setLoading(false);

        // Generate Custom Project (AI)
        try {
          const projectRes = await fetch('/api/ai/generate-project', { method: 'POST' });
          const projectData = await projectRes.json();
          if (projectData.success) {
            setGeneratedProject(projectData.project);
          }
        } catch (err) {
          console.error("Failed to generate project");
        }

        // Auto-generate the roadmap
        setGeneratingRoadmap(true);
        try {
          await axios.post('/api/roadmap/generate', {
            targetRole: 'junior_fullstack',
            maxWeeks: 16,
            hoursPerWeek: 10,
            regenerate: false,
          });
          setRoadmapGenerated(true);
        } catch (roadmapErr) {
          console.error('Failed to generate roadmap', roadmapErr);
          // Don't block the summary view if roadmap generation fails
        } finally {
          setGeneratingRoadmap(false);
        }
      } catch (err) {
        setError(t('assessment.unableToLoad'));
        console.error(err);
        setLoading(false);
      }
    };

    fetchSummaryAndGenerateRoadmap();
  }, [sessionId, t]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('assessment.analyzing')}</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error || t('assessment.unableToLoad')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            {t('assessment.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const getSkillLevelColor = (mastery: number) => {
    if (mastery >= 0.7) return 'text-green-600 bg-green-100';
    if (mastery >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelLabel = (mastery: number) => {
    if (mastery >= 0.7) return t('assessment.strong');
    if (mastery >= 0.4) return t('assessment.developing');
    return t('assessment.beginner');
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('assessment.complete')}</h2>
        <p className="text-gray-600 mt-1">{t('assessment.personalizedProfile')}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('assessment.skillProfile')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.skillProfile?.dimensions?.map((dim) => (
            <div key={dim.dimension} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{dim.dimension.replace(/_/g, ' ')}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSkillLevelColor(dim.mastery)}`}>
                  {getSkillLevelLabel(dim.mastery)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(dim.mastery * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{Math.round(dim.mastery * 100)}% {t('assessment.mastery')}</span>
                <span>{Math.round(dim.confidence * 100)}% {t('assessment.confidence')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary.recommendations && summary.recommendations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('assessment.recommendations')}</h3>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <ul className="space-y-2">
              {summary.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-indigo-800">
                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Generated Capstone Project */}
      {generatedProject && (
        <div className="mb-8 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">{t('assessment.aiGeneratedCapstone')}</span>
              <h3 className="text-xl font-bold">{generatedProject.title}</h3>
            </div>
            <p className="text-gray-300 mb-6">{generatedProject.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('assessment.techStack')}</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedProject.techStack.map((tech: string) => (
                    <span key={tech} className="bg-gray-700 px-3 py-1 rounded text-sm">{tech}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('assessment.milestones')}</h4>
                <ul className="space-y-2">
                  {generatedProject.milestones.map((m: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-indigo-400 mt-1">●</span>
                      <span><strong className="text-white">{m.title}:</strong> {m.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">{t('assessment.readyToLearn')}</h3>
        <p className="text-indigo-100 mb-4">
          {generatingRoadmap
            ? t('assessment.creatingRoadmap')
            : roadmapGenerated
              ? t('assessment.roadmapCreated')
              : t('assessment.viewPath')}
        </p>
        {generatingRoadmap ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>{t('assessment.generatingRoadmap')}</span>
          </div>
        ) : (
          <Link
            href="/student/roadmap"
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            {t('assessment.viewRoadmap')}
          </Link>
        )}
      </div>

      <div className="mt-6 text-center">
        <button onClick={onComplete} className="text-gray-500 hover:text-gray-700 text-sm">
          {t('assessment.returnToDashboard')}
        </button>
      </div>
    </div>
  );
}

