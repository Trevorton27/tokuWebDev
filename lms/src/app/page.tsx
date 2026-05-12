'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* ============================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================ */}
      <section id="home" className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 dark:from-purple-900 dark:via-indigo-900 dark:to-purple-950 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            {t('home.heroBadge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg md:text-2xl mb-6 max-w-3xl mx-auto text-indigo-100">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-indigo-200">
            {t('home.heroSupporting')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment/intake"
              className="px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg"
            >
              {t('home.heroCta')}
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition"
            >
              {t('home.heroCtaSecondary')}
            </a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 2. PROBLEM SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.problemTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.problemSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(`home.problem${n}Title` as any)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`home.problem${n}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. SOLUTION SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.solutionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.solutionSubtitle')}
            </p>
          </div>

          {/* Hybrid Model Highlight */}
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {t('home.solutionHybridTitle')}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              {t('home.solutionHybridDesc')}
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionInstructorTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionInstructorDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionAiTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionAiDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionPersonalTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionPersonalDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. HOW IT WORKS - 4 STEPS */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.howItWorksTitle')}
            </h2>
          </div>
          <div className="max-w-5xl mx-auto space-y-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col md:flex-row items-start gap-6 bg-white dark:bg-dark-card rounded-2xl p-8 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                    {n}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    {t('home.howStepLabel')} {n}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t(`home.howStep${n}Title` as any)}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t(`home.howStep${n}Desc` as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4.5. AI-POWERED SOFTWARE DEVELOPMENT */}
      {/* ============================================ */}
      <section id="ai-development" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
              The Modern Approach
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Is AI-Powered Software Development?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              AI-powered software development is the practice of building applications while using AI tools to accelerate, enhance, and guide the development process.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-3">
              Instead of replacing developers, AI acts as a real-time assistant—helping you write code, solve problems, and learn faster.
            </p>
          </div>

          {/* How AI Helps */}
          <div className="max-w-5xl mx-auto mb-20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">How AI Helps You Build Software</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Write code faster', desc: 'AI can generate functions, components, and boilerplate instantly—so you spend less time on repetitive work and more time on meaningful logic.', color: 'indigo' },
                { title: 'Understand complex concepts', desc: 'Stuck on an error or unfamiliar topic? AI can explain code, debug issues, and break down concepts in real time.', color: 'purple' },
                { title: 'Improve code quality', desc: 'AI can suggest better patterns, catch mistakes, and help you refactor code into cleaner, more maintainable solutions.', color: 'teal' },
                { title: 'Learn more efficiently', desc: 'Instead of searching through dozens of tutorials, you get personalized guidance exactly when you need it.', color: 'blue' },
                { title: 'Build more ambitious projects', desc: 'With AI handling low-level friction, you can focus on building real-world applications sooner.', color: 'pink' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mb-4`}>
                    <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}

              {/* What This Looks Like card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">What This Looks Like in Practice</h4>
                <ul className="space-y-2">
                  {[
                    'Generating a React component from a simple description',
                    'Debugging an API error with step-by-step guidance',
                    'Getting instant feedback on your code',
                    'Building full features with AI-assisted iteration',
                    'Learning new frameworks with on-demand explanations',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-gray-900 dark:bg-dark-card rounded-2xl p-8 md:p-10 text-white">
              <h3 className="text-2xl font-bold mb-4">Why It Matters</h3>
              <p className="text-gray-300 mb-6">Software development is evolving. AI is becoming a standard tool in every developer's workflow, much like:</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {['Version Control (Git)', 'Frameworks (React, Next.js)', 'Cloud Platforms (AWS, Vercel)'].map((tool) => (
                  <span key={tool} className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">{tool}</span>
                ))}
              </div>
              <p className="text-gray-300 mb-3">Developers who know how to use AI effectively will:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {['Learn faster', 'Build faster', 'Solve more complex problems'].map((point) => (
                  <div key={point} className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">Development With AI vs Without AI</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Without AI */}
              <div className="rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="bg-gray-100 dark:bg-dark-surface px-6 py-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Traditional Development</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Without AI</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">How it works</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Write and debug everything manually</li>
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Learning relies on documentation, tutorials, and trial-and-error</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Strong foundational understanding</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Predictable and controlled workflows</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Deep problem-solving skills</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Challenges</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Slower development speed</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>High friction when learning new tools</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Time lost searching for answers and debugging</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* With AI */}
              <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h4 className="font-bold text-white">AI-Powered Development</h4>
                  <p className="text-sm text-indigo-200">With AI</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">How it works</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Collaborate with AI tools during development</li>
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>AI assists with coding, debugging, and learning in real time</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Faster development and iteration</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Immediate feedback and guidance</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Easier to learn new technologies</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Reduced time on repetitive tasks</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Challenges</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Requires judgment to evaluate AI output</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Risk of over-reliance without understanding fundamentals</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Still needs strong core knowledge to use effectively</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Most Effective Approach</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The best developers don&apos;t choose one or the other—they combine both.
                <br /><strong className="text-gray-900 dark:text-white">Fundamentals</strong> give you understanding and control.
                <strong className="text-gray-900 dark:text-white"> AI tools</strong> give you speed and leverage.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {['Build real applications faster', 'Learn more efficiently', 'Work at a higher level of abstraction'].map((point) => (
                  <div key={point} className="bg-white dark:bg-dark-card rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border">
                    {point}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Learning to code is still essential. But learning to code <em>with AI</em> is what makes you truly effective in today&apos;s landscape.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* 5. FEATURES / BENEFITS */}
      {/* ============================================ */}
      <section id="features" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.whyChoose')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { titleKey: 'home.adaptiveLearningTitle', descKey: 'home.adaptiveLearningDesc', color: 'indigo' },
              { titleKey: 'home.aiTutoringTitle', descKey: 'home.aiTutoringDesc', color: 'purple' },
              { titleKey: 'home.realProjectsTitle', descKey: 'home.realProjectsDesc', color: 'teal' },
              { titleKey: 'home.multilingualTitle', descKey: 'home.multilingualDesc', color: 'pink' },
              { titleKey: 'home.progressTrackingTitle', descKey: 'home.progressTrackingDesc', color: 'blue' },
              { titleKey: 'home.comprehensiveCoursesTitle', descKey: 'home.comprehensiveCoursesDesc', color: 'green' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border hover:shadow-md transition">
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4`}>
                  <svg className={`w-5 h-5 text-${feature.color}-600 dark:text-${feature.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(feature.titleKey as any)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(feature.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 6. CURRICULUM PREVIEW */}
      {/* ============================================ */}
      <section id="curriculum" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.curriculumTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.curriculumSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'home.foundationsTitle', items: ['home.foundationsItem1', 'home.foundationsItem3', 'home.foundationsItem4'] },
              { title: 'home.frontendTitle', items: ['home.frontendItem1', 'home.frontendItem2', 'home.frontendItem3'] },
              { title: 'home.backendTitle', items: ['home.backendItem1', 'home.backendItem2', 'home.backendItem3'] },
            ].map((module, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t(module.title as any)}
                </h3>
                <ul className="space-y-2">
                  {module.items.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t(item as any)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. OUTCOMES */}
      {/* ============================================ */}
      <section id="outcomes" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.outcomesTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.outcomesSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">{n}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(`home.outcome${n}Title` as any)}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {t(`home.outcome${n}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 8. ABOUT */}
      {/* ============================================ */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-stretch gap-12">
              <div className="flex-shrink-0 self-stretch hidden md:flex">
                <div className="relative w-72 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-800">
                  <Image
                    src="/trevor-profile.png"
                    alt="Trevor — Software Professional and Educator"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-shrink-0 md:hidden">
                <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-800">
                  <Image
                    src="/trevor-profile.png"
                    alt="Trevor — Software Professional and Educator"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  About the Instructor
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Hi, I&apos;m Trevor — a software professional and educator with experience working in international technical support, software development, and DevOps environments.
                  </p>
                  <p>
                    Over the past few years, I&apos;ve worked with cloud-based platforms, APIs, and modern web technologies, helping both companies and individuals solve real technical problems. My work has involved everything from debugging production systems to building full-stack applications and supporting enterprise clients in both English and Japanese.
                  </p>
                  <p>
                    What I&apos;ve learned through that experience is that the biggest gap for most learners isn&apos;t access to information — it&apos;s knowing what to focus on, how to practice effectively, and how to apply skills in real-world scenarios.
                  </p>
                  <p>
                    That&apos;s exactly what this program is designed to help with.
                  </p>
                  <p>
                    Rather than just teaching concepts, I focus on helping you build practical skills through guided projects, structured learning paths, and real coding challenges. The goal is not just to understand development, but to become confident using it in real situations.
                  </p>
                  <p>
                    Whether you&apos;re starting from scratch or leveling up your existing skills, I&apos;m here to help you move forward with clarity and purpose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 9. TESTIMONIALS */}
      {/* ============================================ */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.testimonialsTitle')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Kevin Bisner',
                role: 'Full Stack Developer',
                linkedin: 'https://www.linkedin.com/in/kevinbisner/',
                quote: 'Working with Trevor was awesome. Being new in the field of software development I needed a knowledgeable and communicative mentor who could really help me improve my skills. Trevor was exactly that. His code reviews of my projects made in SDMM showed me how to write functional, effective, and efficient code. I\'m a much better developer because of him. He is one of the people who have really helped me succeed in this field.',
              },
              {
                name: 'Brandon Chuck',
                role: 'Software Engineer',
                linkedin: 'https://www.linkedin.com/in/brandonchuck/',
                quote: 'I first met Trevor in a software development mentorship program. I was met with kindness, patience, and a tailored approach to teaching the complex world of software development. Trevor has an undeniable grasp of the fundamentals and is passionate about transferring his knowledge to his students. He always put an emphasis on gaining a deeper understanding of fundamentals like debugging, functional organization, and readability, ultimately helping us construct a developer mindset. Looking back at the program now big picture concepts were also something Trevor sought to help us understand which has always stuck with me. With his guidance and teachings I felt confident and prepared to step into my first software developer role after completing the program.',
              },
              {
                name: 'Gregory Hilger',
                role: 'Full Stack Software Developer JS | React | C# | .Net',
                linkedin: 'https://www.linkedin.com/in/gregoryhilger/',
                quote: 'I had the pleasure of working with Trevor through the SDMM online program, and I cannot speak highly enough about his expertise and friendliness. His lessons were insightful and engaging, making complex coding concepts feel accessible to beginners like me. Throughout the program Trevor showed a dedication and passion for helping others grow their skills. He always provided clear and concise explanations and would review my coding projects, offering constructive feedback that helped me learn and succeed in the program. Trevor was always knowledgeable and yet so down-to-earth, making the experience very enjoyable. I am grateful for the opportunity to learn from Trevor and I wholeheartedly recommend him as a mentor in the world of programming.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm flex flex-col">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{testimonial.role}</p>
                  <a
                    href={testimonial.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 rounded-md transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    View on LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10. PRICING / OFFER */}
      {/* ============================================ */}
      <section id="pricing" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.pricingTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.pricingSubtitle')}
            </p>
          </div>
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 md:p-10 border-2 border-indigo-200 dark:border-indigo-800/50 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('home.pricingPlanName')}
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('home.pricingValueLabel')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <li key={n} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t(`home.pricingFeature${n}` as any)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('home.pricingBonusLabel')}
              </p>
              <ul className="space-y-1">
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🎁</span>
                  {t('home.pricingBonus1')}
                </li>
                <li className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                  <span className="mr-2">🎁</span>
                  {t('home.pricingBonus2')}
                </li>
              </ul>
            </div>

            <Link
              href="/assessment/intake"
              className="block w-full text-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
            >
              {t('home.pricingCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 11. FINAL CTA - Schedule a Free Consultation */}
      {/* ============================================ */}
      <section id="contact" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-900 dark:to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {t('home.finalCtaTitle')}
            </h2>
            <p className="text-lg md:text-xl text-indigo-100">
              {t('home.finalCtaSubtitle')}
            </p>
          </div>

          <form
            action="mailto:trevor-sensei@signalworksdesign.com"
            method="post"
            encType="text/plain"
            className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-indigo-100 mb-1.5">
                  {t('home.contactName')}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-indigo-100 mb-1.5">
                  {t('home.contactEmail')}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="contact-phone" className="block text-sm font-medium text-indigo-100 mb-1.5">
                {t('home.contactPhone')}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="contact-message" className="block text-sm font-medium text-indigo-100 mb-1.5">
                {t('home.contactMessage')}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition shadow-xl text-lg"
            >
              {t('home.finalCtaButton')}
            </button>
            <p className="text-center text-indigo-200 text-sm mt-4">
              {t('home.finalCtaSecondary')}
            </p>
          </form>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Signal Works Design</h3>
              <p className="text-sm">
                {t('home.footerTagline')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerPlatform')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">{t('home.footerFeatures')}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">{t('home.footerHowItWorks')}</a></li>
                <li><a href="#curriculum" className="hover:text-white transition">{t('home.footerCurriculum')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerCompany')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">{t('home.footerAbout')}</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">{t('home.footerTestimonials')}</a></li>
                <li><a href="#faq" className="hover:text-white transition">{t('home.footerFAQ')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerContact')}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t('home.footerSupport')}</li>
                <li>{t('home.footerCommunity')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>{t('home.footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
