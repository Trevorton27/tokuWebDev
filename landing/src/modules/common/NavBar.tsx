'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en');
  };

  return (
    <nav className="bg-indigo-600 dark:bg-dark-surface text-white shadow-lg sticky top-0 z-50 border-b border-transparent dark:border-dark-border transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Signal Works Design
            </Link>

            {isHomePage && (
              <div className="hidden md:flex space-x-6">
                <a href="#how-it-works" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.howItWorks')}
                </a>
                <a href="#features" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.features')}
                </a>
                <a href="#curriculum" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.curriculum')}
                </a>
                <a href="#outcomes" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.outcomes')}
                </a>
                <a href="#about" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.instructor')}
                </a>
                <a href="#testimonials" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.testimonials')}
                </a>
                <a href="#pricing" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.pricing')}
                </a>
                <a href="#contact" className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                  {t('nav.contact')}
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-indigo-700 dark:bg-dark-card hover:bg-indigo-800 dark:hover:bg-dark-hover transition"
              aria-label="Toggle language"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-medium">{language === 'en' ? 'EN' : '日本語'}</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
