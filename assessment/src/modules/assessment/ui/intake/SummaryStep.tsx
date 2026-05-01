'use client';

import { useEffect, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getAssessmentSummary();
        setSummary(data);
        setLoading(false);
      } catch (err) {
        setError(t('assessment.unableToLoad'));
        console.error(err);
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sessionId, t]);

  async function handleSubmit() {
    setSubmitState('submitting');
    setSubmitError(null);
    try {
      const res = await fetch('/api/assessment/intake/finalize', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setSubmitState('submitted');
      } else {
        setSubmitError(json.error || 'Failed to send results. Please try again.');
        setSubmitState('error');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      setSubmitState('error');
    }
  }

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

      {submitState === 'submitted' ? (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Results Sent</h3>
          <p className="text-indigo-100 text-sm">
            Check your inbox — we&apos;ve sent your assessment results and next steps. Our team will be in touch soon.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-dark-border rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to submit your answers?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            After submission, your results will be compiled and we will send you an email with an invitation to discuss your background and goals and to go over your roadmap.
          </p>

          {submitState === 'error' && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
              {submitError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onComplete}
              className="px-5 py-2.5 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover font-medium transition text-sm"
            >
              Go back &amp; complete questions
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitState === 'submitting'}
              className="px-5 py-2.5 bg-indigo-600 dark:bg-purple-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-purple-700 font-medium transition text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitState === 'submitting' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              {submitState === 'submitting' ? 'Compiling results…' : 'Submit answers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

