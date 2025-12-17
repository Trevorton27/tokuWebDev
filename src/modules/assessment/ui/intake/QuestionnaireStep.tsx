'use client';

import { useState, useEffect } from 'react';
import type { QuestionnaireStepConfig } from '@/server/assessment/intakeConfig';

interface Props {
  config: QuestionnaireStepConfig;
  onSubmit: (answer: Record<string, any>) => void;
  previousAnswer?: Record<string, any>;
  isSubmitting: boolean;
}

export default function QuestionnaireStep({ config, onSubmit, previousAnswer, isSubmitting }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(previousAnswer || {});

  useEffect(() => {
    if (previousAnswer) {
      setAnswers(previousAnswer);
    }
  }, [previousAnswer]);

  const handleChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  const isValid = config.fields
    .filter((f) => f.required)
    .every((f) => answers[f.id] !== undefined && answers[f.id] !== '');

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{config.description}</p>
      </div>

      <div className="space-y-6">
        {config.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block font-medium text-gray-900 dark:text-white">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
            )}

            {field.type === 'text' && (
              <input
                type="text"
                value={answers[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            )}

            {field.type === 'url' && (
              <input
                type="url"
                value={answers[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            )}

            {field.type === 'select' && (
              <select
                value={answers[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select an option...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'multiselect' && (
              <div className="space-y-2">
                {field.options?.map((opt) => (
                  <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(answers[field.id] || []).includes(opt.value)}
                      onChange={(e) => {
                        const current = answers[field.id] || [];
                        if (e.target.checked) {
                          handleChange(field.id, [...current, opt.value]);
                        } else {
                          handleChange(field.id, current.filter((v: string) => v !== opt.value));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'slider' && (
              <div className="space-y-2">
                <input
                  type="range"
                  min={field.min || 1}
                  max={field.max || 5}
                  value={answers[field.id] || field.min || 1}
                  onChange={(e) => handleChange(field.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{field.min || 1} - No experience</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {answers[field.id] || field.min || 1}
                  </span>
                  <span>{field.max || 5} - Very confident</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium ${
            isValid && !isSubmitting
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </form>
  );
}
