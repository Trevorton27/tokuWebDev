'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useState } from 'react';

export default function LandingPageSample() {
  const { t } = useLanguage();
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section - Enhanced with CTAs and Trust Badges */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-purple-900 dark:via-indigo-900 dark:to-purple-800 text-white py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-indigo-100">
              {t('landing.heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/assessment"
                className="group px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {t('landing.heroCTA')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={() => setVideoPlaying(true)}
                className="px-10 py-5 bg-transparent border-3 border-white text-white rounded-xl font-bold hover:bg-white hover:text-indigo-600 transition-all text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                {t('landing.heroSecondaryCTA')}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('landing.trustBadge1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('landing.trustBadge2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('landing.trustBadge3')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-indigo-50 dark:bg-gray-900 border-y border-indigo-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {t('landing.socialProofTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">95%</div>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.socialProof1')}</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">$35K+</div>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.socialProof2')}</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">4.9/5</div>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.socialProof3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced with Icons */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4">
            {t('landing.benefitsTitle')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mt-16">
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('landing.benefit1Title')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.benefit1Desc')}</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('landing.benefit2Title')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.benefit2Desc')}</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('landing.benefit3Title')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.benefit3Desc')}</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('landing.benefit4Title')}</h3>
              <p className="text-gray-700 dark:text-gray-300">{t('landing.benefit4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features from home page */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            {t('home.whyChoose')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-indigo-300 dark:hover:border-indigo-600">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('home.aiTutoringTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.aiTutoringDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-purple-300 dark:hover:border-purple-600">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('home.adaptiveLearningTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.adaptiveLearningDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-blue-300 dark:hover:border-blue-600">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('home.comprehensiveCoursesTitle')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.comprehensiveCoursesDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-green-300 dark:hover:border-green-600">
              <div className="text-5xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('home.realProjectsTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.realProjectsDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-pink-300 dark:hover:border-pink-600">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('home.progressTrackingTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.progressTrackingDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:border-orange-300 dark:hover:border-orange-600">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('home.multilingualTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.multilingualDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - New */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('landing.pricingTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('landing.pricingSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('landing.planBasic')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t('landing.priceBasic')}</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planBasicFeature1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planBasicFeature2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planBasicFeature3')}</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t('landing.choosePlan')}
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl border-2 border-indigo-300 p-8 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t('landing.planPro')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{t('landing.pricePro')}</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">{t('landing.planProFeature1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">{t('landing.planProFeature2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">{t('landing.planProFeature3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white">{t('landing.planProFeature4')}</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                {t('landing.choosePlan')}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 hover:border-purple-400 dark:hover:border-purple-500 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('landing.planEnterprise')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{t('landing.priceEnterprise')}</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planEnterpriseFeature1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planEnterpriseFeature2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('landing.planEnterpriseFeature3')}</span>
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full text-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t('landing.contactSales')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            {t('home.testimonialsTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "The AI tutor is incredible! It&apos;s like having a personal mentor available 24/7. I went from complete beginner to landing my first dev job in 6 months."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Sarah Chen</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Frontend Developer</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "The adaptive challenges kept me engaged and motivated. I never felt overwhelmed or bored. The project-based approach helped me build a strong portfolio."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Marcus Johnson</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Full Stack Developer</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "As a career changer, I was intimidated by coding. Signal Works made learning accessible and fun. The instructors are supportive and the curriculum is top-notch."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  E
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Emily Rodriguez</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-purple-900 dark:via-indigo-900 dark:to-purple-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('landing.finalCTATitle')}
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-indigo-100">
            {t('landing.finalCTASubtitle')}
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            {t('landing.finalCTA')}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-6 text-indigo-100">
            {t('landing.finalNoCard')}
          </p>
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="/landing-page-sample" className="hover:text-white transition">{t('home.footerCurriculum')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerCompany')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">{t('home.footerAbout')}</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">{t('home.footerTestimonials')}</a></li>
                <li><Link href="/" className="hover:text-white transition">{t('home.footerFAQ')}</Link></li>
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

      {/* Video Modal */}
      {videoPlaying && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setVideoPlaying(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-lg">
            <button
              onClick={() => setVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Demo video placeholder - Add your YouTube or Vimeo embed here</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </main>
  );
}
