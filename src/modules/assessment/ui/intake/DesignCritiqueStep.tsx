'use client';

import { useState, useEffect } from 'react';
import type { DesignCritiqueStepConfig } from '@/server/assessment/intakeConfig';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  config: DesignCritiqueStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
}

export default function DesignCritiqueStep({ config, onSubmit, previousAnswer, isSubmitting }: Props) {
  const { t } = useLanguage();
  const [critique, setCritique] = useState(previousAnswer?.critique || '');

  useEffect(() => {
    if (previousAnswer?.critique) {
      setCritique(previousAnswer.critique);
    }
  }, [previousAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ critique });
  };

  const minLength = 100;
  const maxLength = 800;
  const charCount = critique.length;
  const isValid = charCount >= minLength && charCount <= maxLength;

  const getCharCountColor = () => {
    if (charCount < minLength) return 'text-red-500';
    if (charCount > maxLength * 0.9) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-800 font-medium">{config.prompt}</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">{t('assessment.designToCritique')}</h3>

          {config.inlineHtml && (
            <div
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg mb-3"
              dangerouslySetInnerHTML={{ __html: config.inlineHtml }}
            />
          )}

          {config.imageUrl && (
            <div className="mb-3">
              <img
                src={config.imageUrl}
                alt="Design to critique"
                className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          <p className="text-sm text-gray-600 italic">{config.designDescription}</p>
        </div>

        <div className="relative">
          <label className="block font-medium text-gray-900 mb-2">{t('assessment.yourCritique')}</label>
          <textarea
            value={critique}
            onChange={(e) => setCritique(e.target.value)}
            placeholder={t('assessment.critiquePlaceholder')}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <div className={`absolute bottom-3 right-3 text-sm ${getCharCountColor()}`}>
            {charCount} / {maxLength}
            {charCount < minLength && (
              <span className="ml-2">(min: {minLength})</span>
            )}
          </div>
        </div>

        {charCount < minLength && charCount > 0 && (
          <p className="mt-2 text-sm text-red-500">
            {t('assessment.minCharsNeeded').replace('{min}', String(minLength)).replace('{remaining}', String(minLength - charCount))}
          </p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p className="text-yellow-800 text-sm font-medium">{t('assessment.thingsToConsider')}</p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
              <li>{t('assessment.colorContrast')}</li>
              <li>{t('assessment.typography')}</li>
              <li>{t('assessment.layout')}</li>
              <li>{t('assessment.uxAccessibility')}</li>
              <li>{t('assessment.visualHierarchy')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium ${isValid && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? t('assessment.saving') : t('assessment.continue')}
        </button>
      </div>
    </form>
  );
}

