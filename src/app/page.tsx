'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-900 dark:to-indigo-900 text-white py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">
            {t('home.heroTitle')}
          </h1>
          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/assessment"
              className="px-10 py-4 bg-white dark:bg-purple-600 text-indigo-600 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-purple-700 transition text-lg"
            >
              {t('home.tryAssessment')}
            </Link>
            <a
              href="#about"
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 dark:hover:text-purple-600 transition text-lg"
            >
              {t('home.learnMore')}
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
              {t('home.aboutTitle')}
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              {t('home.aboutSubtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-100">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.forLearnersTitle')}</h3>
                <p className="text-gray-700">
                  {t('home.forLearnersDesc')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-100">
                <div className="text-4xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.forInstructorsTitle')}</h3>
                <p className="text-gray-700">
                  {t('home.forInstructorsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('home.howItWorksTitle')}
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.step1Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step1Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.step2Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step2Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.step3Title')}</h3>
                <p className="text-gray-600">
                  {t('home.step3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('home.whyChoose')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.aiTutoringTitle')}
              </h3>
              <p className="text-gray-600">
                {t('home.aiTutoringDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.adaptiveLearningTitle')}
              </h3>
              <p className="text-gray-600">
                {t('home.adaptiveLearningDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.comprehensiveCoursesTitle')}
              </h3>
              <p className="text-gray-600">
                {t('home.comprehensiveCoursesDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.realProjectsTitle')}</h3>
              <p className="text-gray-600">
                {t('home.realProjectsDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.progressTrackingTitle')}</h3>
              <p className="text-gray-600">
                {t('home.progressTrackingDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('home.multilingualTitle')}</h3>
              <p className="text-gray-600">
                {t('home.multilingualDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section id="curriculum" className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            {t('home.curriculumTitle')}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            {t('home.curriculumSubtitle')}
          </p>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-indigo-600 mb-3">{t('home.foundationsTitle')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.foundationsItem1')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.foundationsItem2')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.foundationsItem3')}
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-purple-600 mb-3">{t('home.frontendTitle')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.frontendItem1')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.frontendItem2')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.frontendItem3')}
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-blue-600 mb-3">{t('home.backendTitle')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.backendItem1')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.backendItem2')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.backendItem3')}
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-orange-600 mb-3">{t('home.advancedTitle')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.advancedItem1')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.advancedItem2')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('home.advancedItem3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">{t('home.stat1')}</div>
              <div className="text-indigo-200">{t('home.stat1Label')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{t('home.stat2')}</div>
              <div className="text-indigo-200">{t('home.stat2Label')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{t('home.stat3')}</div>
              <div className="text-indigo-200">{t('home.stat3Label')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{t('home.stat4')}</div>
              <div className="text-indigo-200">{t('home.stat4Label')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('home.testimonialsTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-4">
                "The AI tutor is incredible! It's like having a personal mentor available 24/7. I went from complete beginner to landing my first dev job in 6 months."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">Frontend Developer</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-4">
                "The adaptive challenges kept me engaged and motivated. I never felt overwhelmed or bored. The project-based approach helped me build a strong portfolio."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marcus Johnson</div>
                  <div className="text-sm text-gray-600">Full Stack Developer</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-xl">★★★★★</div>
              </div>
              <p className="text-gray-700 mb-4">
                "As a career changer, I was intimidated by coding. Signal Works made learning accessible and fun. The instructors are supportive and the curriculum is top-notch."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  E
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Emily Rodriguez</div>
                  <div className="text-sm text-gray-600">Software Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
              {t('home.contactTitle')}
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              {t('home.contactSubtitle')}
            </p>
            <form className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-100 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('home.contactName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder={t('home.contactName')}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('home.contactEmail')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder={t('home.contactEmail')}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('home.contactPhone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder={t('home.contactPhone')}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('home.contactMessage')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder={t('home.contactMessage')}
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
              >
                {t('home.contactSubmit')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('home.faqTitle')}
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.faq1Q')}
              </h3>
              <p className="text-gray-600">
                {t('home.faq1A')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.faq2Q')}
              </h3>
              <p className="text-gray-600">
                {t('home.faq2A')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.faq3Q')}
              </h3>
              <p className="text-gray-600">
                {t('home.faq3A')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.faq4Q')}
              </h3>
              <p className="text-gray-600">
                {t('home.faq4A')}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.faq5Q')}
              </h3>
              <p className="text-gray-600">
                {t('home.faq5A')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('home.readyTitle')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('home.readySubtitle')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/assessment"
              className="px-10 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              {t('home.getStarted')}
            </Link>
            <a
              href="#about"
              className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition text-lg"
            >
              {t('home.learnMore')}
            </a>
          </div>
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
