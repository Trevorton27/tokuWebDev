'use client';

import { useState } from 'react';
import type { CodeReviewStepConfig } from '@/server/assessment/intakeConfig';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
    config: CodeReviewStepConfig;
    onSubmit: (answer: Record<string, any>) => void;
    previousAnswer?: Record<string, any>;
    isSubmitting: boolean;
}

export default function CodeReviewStep({ config, onSubmit, previousAnswer, isSubmitting }: Props) {
    const { t } = useLanguage();
    const [critique, setCritique] = useState(previousAnswer?.critique || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ critique });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{config.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Code View */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('assessment.codeToReview')}</h3>
                    <div className="bg-gray-900 rounded-lg p-4 h-[400px] overflow-auto border border-gray-700">
                        <pre className="text-gray-100 text-sm font-mono whitespace-pre">{config.codeSnippet}</pre>
                    </div>
                </div>

                {/* Review Interface */}
                <div className="flex flex-col h-[400px]">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border border-blue-100 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">{config.prompt}</h4>
                        <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-300 space-y-1">
                            {config.lookingFor.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t('assessment.yourReviewComments')}
                    </label>
                    <textarea
                        value={critique}
                        onChange={(e) => setCritique(e.target.value)}
                        className="flex-1 w-full px-4 py-3 bg-white dark:bg-dark-bg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                        placeholder={t('assessment.issuesFoundPlaceholder')}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!critique.trim() || isSubmitting}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${critique.trim() && !isSubmitting
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                        }`}
                >
                    {isSubmitting ? t('assessment.submitting') : t('assessment.submitContinue')}
                </button>
            </div>
        </form>
    );
}

