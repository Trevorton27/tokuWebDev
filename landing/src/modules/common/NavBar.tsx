'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '#how-it-works', key: 'nav.howItWorks' },
  { href: '#features', key: 'nav.features' },
  { href: '#curriculum', key: 'nav.curriculum' },
  { href: '#outcomes', key: 'nav.outcomes' },
  { href: '#about', key: 'nav.instructor' },
  { href: '#testimonials', key: 'nav.testimonials' },
  { href: '#pricing', key: 'nav.pricing' },
  { href: '#course', key: 'nav.course' },
  { href: '#contact', key: 'nav.contact' },
] as const;

export default function NavBar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

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
                {NAV_LINKS.map(({ href, key }) => (
                  <a key={href} href={href} className="hover:text-indigo-200 dark:hover:text-purple-300 transition">
                    {t(key)}
                  </a>
                ))}
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

            {isHomePage && (
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden p-2 rounded-md hover:bg-indigo-700 transition"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {isHomePage && menuOpen && (
        <div className="md:hidden bg-indigo-700 dark:bg-dark-card border-t border-indigo-500 dark:border-dark-border">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
            {NAV_LINKS.map(({ href, key }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md hover:bg-indigo-600 dark:hover:bg-dark-hover transition text-sm font-medium"
              >
                {t(key)}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
