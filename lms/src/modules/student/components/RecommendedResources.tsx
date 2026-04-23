/**
 * Recommended Resources Component
 * Curated list of learning resources for web development
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Resource {
  name: string;
  url: string;
  description: string;
  topics?: Array<{ name: string; url: string }>;
}

export default function RecommendedResources() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reading' | 'practice'>('reading');

  const readingResources: Array<{ categoryKey: string; icon: string; resources: Resource[] }> = [
    {
      categoryKey: 'student.resourceCategoryWeb',
      icon: '🌐',
      resources: [
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/',
          description: 'Canonical reference for how the web actually works',
          topics: [
            { name: 'HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
            { name: 'Flexbox', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout' },
            { name: 'CSS Grid', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout' },
            { name: 'Modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' },
          ],
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryReact',
      icon: '⚛️',
      resources: [
        {
          name: 'Official React Documentation',
          url: 'https://react.dev/',
          description: 'Modern, hook-first docs emphasizing thinking in components, state vs props, and effects as synchronization',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryTS',
      icon: '🔷',
      resources: [
        {
          name: 'TypeScript Handbook',
          url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
          description: 'Read selectively. Priority topics include everyday types, narrowing, and generics',
          topics: [
            { name: 'Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html' },
            { name: 'Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' },
            { name: 'Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' },
          ],
        },
        {
          name: 'Matt Pocock – Total TypeScript',
          url: 'https://www.totaltypescript.com/',
          description: 'Excellent explanations of real-world TypeScript usage in React apps',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryNextjs',
      icon: '▲',
      resources: [
        {
          name: 'Next.js Documentation (App Router)',
          url: 'https://nextjs.org/docs/app',
          description: 'Server vs Client Components, Routing & layouts, Data fetching, Environment variables & deployment',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryUI',
      icon: '🎨',
      resources: [
        {
          name: 'Refactoring UI',
          url: 'https://www.refactoringui.com/',
          description: 'Non-code but transformative for improving visual quality and hierarchy',
        },
        {
          name: "Josh Comeau's Blog",
          url: 'https://www.joshwcomeau.com/',
          description: 'Deep, approachable explanations of rendering, performance, and UX details',
        },
      ],
    },
  ];

  const practiceResources: Array<{ categoryKey: string; icon: string; resources: Resource[] }> = [
    {
      categoryKey: 'student.resourceCategoryInteractive',
      icon: '📖',
      resources: [
        {
          name: 'freeCodeCamp',
          url: 'https://www.freecodecamp.org/',
          description: 'Good for early confidence with JavaScript, React, and small projects',
        },
        {
          name: 'Scrimba (React / Next.js)',
          url: 'https://scrimba.com/',
          description: 'Interactive lessons where students pause and edit the code directly',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryProject',
      icon: '🚀',
      resources: [
        {
          name: 'Next.js Examples (GitHub)',
          url: 'https://github.com/vercel/next.js/tree/canary/examples',
          description: 'Real-world patterns for auth, APIs, and data fetching',
        },
        {
          name: 'Vercel',
          url: 'https://vercel.com/',
          description: 'Deployment should be part of learning from day one',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryExperiment',
      icon: '🧪',
      resources: [
        {
          name: 'TypeScript Playground',
          url: 'https://www.typescriptlang.org/play',
          description: 'Perfect for experimenting with types without project setup',
        },
        {
          name: 'CodeSandbox',
          url: 'https://codesandbox.io/',
          description: 'Fast React and Next.js experimentation',
        },
        {
          name: 'StackBlitz',
          url: 'https://stackblitz.com/',
          description: 'Instant dev environments, especially good for small demos',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryGit',
      icon: '📂',
      resources: [
        {
          name: 'GitHub',
          url: 'https://github.com/',
          description: 'Students should push code regularly and treat commits as communication',
        },
        {
          name: 'GitHub Docs (Core Workflows)',
          url: 'https://docs.github.com/en/get-started',
          description: 'Covers pull requests, issues, and collaboration basics',
        },
      ],
    },
    {
      categoryKey: 'student.resourceCategoryChallenge',
      icon: '⚡',
      resources: [
        {
          name: 'Edabit',
          url: 'https://edabit.com/',
          description: 'Interactive coding challenges and tutorials for JavaScript practice',
        },
        {
          name: 'Frontend Mentor',
          url: 'https://www.frontendmentor.io/',
          description: 'Practice building real UIs from design specs',
        },
        {
          name: 'CodeWars',
          url: 'https://www.codewars.com/',
          description: 'Logic and JavaScript practice',
        },
        {
          name: 'LeetCode',
          url: 'https://leetcode.com/',
          description: 'Optional for algorithmic thinking, not a primary web-dev focus',
        },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('student.resources')}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-200 dark:border-dark-border">
        <button
          onClick={() => setActiveTab('reading')}
          className={`px-3 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'reading'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          📖 {t('student.reading')}
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-3 py-2 font-medium text-sm transition-all border-b-2 ${activeTab === 'practice'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          💻 {t('student.practice')}
        </button>
      </div>

      {/* Content - Flattened */}
      <div className="space-y-5">
        {activeTab === 'reading' ? (
          <>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                {t('student.readingTip')}
              </p>
            </div>

            {readingResources.map((section, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-base">{section.icon}</span>
                  {t(section.categoryKey)}
                </h3>

                {section.resources.map((resource, ridx) => (
                  <div
                    key={ridx}
                    className="border-l-2 border-blue-200 dark:border-blue-800/50 pl-3 py-1"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      {resource.name}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {resource.description}
                    </p>

                    {resource.topics && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {resource.topics.map((topic, tidx) => (
                          <a
                            key={tidx}
                            href={topic.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            {topic.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-900 dark:text-green-100">
                {t('student.practiceTip')}
              </p>
            </div>

            {practiceResources.map((section, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="text-base">{section.icon}</span>
                  {t(section.categoryKey)}
                </h3>

                {section.resources.map((resource, ridx) => (
                  <div
                    key={ridx}
                    className="border-l-2 border-green-200 dark:border-green-800/50 pl-3 py-1"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      {resource.name}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {resource.description}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
