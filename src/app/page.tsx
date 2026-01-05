'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black dark:bg-black flex flex-col">
      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-900 dark:to-indigo-900 text-white py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">
            {t('home.heroTitle')}
          </h1>
          <p className="text-2xl mb-12 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Spacer to push footer to bottom */}
      <div className="flex-grow bg-black dark:bg-black"></div>

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
