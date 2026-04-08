'use client';

import Link from 'next/link';
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
      <section className="py-20 bg-white dark:bg-black">
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
              { name: 'Yuki T.', role: 'Frontend Developer', quote: 'The two-stage assessment showed me exactly what I needed to learn. No more wasted time on tutorials that didn\'t apply to my goals.' },
              { name: 'Marcus L.', role: 'Career Changer', quote: 'Coming from a non-technical background, the personalized roadmap and instructor support made all the difference. I landed my first dev role in 6 months.' },
              { name: 'Hana S.', role: 'Full-Stack Engineer', quote: 'The hybrid model is genius. I get the structure of live sessions and the flexibility of AI practice — both in English and Japanese.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10. PRICING / OFFER */}
      {/* ============================================ */}
      <section className="py-20 bg-white dark:bg-black">
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
            action="mailto:support@signalworks.com"
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
              <h3 className="text-white font-bold text-lg mb-4">TokuWebDev</h3>
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
