'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';

export default function NavBar() {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleLanguage = () => setLanguage(language === 'en' ? 'ja' : 'en');

  const ja = language === 'ja';

  const GROUPS = [
    {
      key: 'courses',
      label: ja ? 'コース' : 'Courses',
      items: [
        {
          href: '#foundations',
          label: ja ? 'ファウンデーションズトラック' : 'Foundations Track',
          desc: ja ? '3ヶ月 · ¥150,000 · コードファースト' : '3 months · ¥150,000 · Code-first',
        },
        {
          href: '#course',
          label: ja ? 'フルコース' : 'Full Course',
          desc: ja ? '5ヶ月 · ¥200,000 · AI活用ワークフロー' : '5 months · ¥200,000 · AI-powered workflow',
        },
      ],
    },
    {
      key: 'program',
      label: ja ? 'プログラム' : 'Program',
      items: [
        { href: '#how-it-works', label: t('nav.howItWorks'), desc: undefined },
        { href: '#features', label: t('nav.features'), desc: undefined },
        { href: '#curriculum', label: t('nav.curriculum'), desc: undefined },
        { href: '#outcomes', label: t('nav.outcomes'), desc: undefined },
      ],
    },
    {
      key: 'about',
      label: ja ? '私たちについて' : 'About',
      items: [
        { href: '#about', label: t('nav.instructor'), desc: undefined },
        { href: '#testimonials', label: t('nav.testimonials'), desc: undefined },
      ],
    },
    {
      key: 'info',
      label: ja ? '料金・FAQ' : 'Info',
      items: [
        { href: '#pricing', label: t('nav.pricing'), desc: undefined },
        { href: '#faq', label: t('nav.faq'), desc: undefined },
      ],
    },
  ];

  const toggle = (key: string) => setOpenDropdown(openDropdown === key ? null : key);

  return (
    <nav
      ref={navRef}
      className="bg-indigo-600 dark:bg-dark-surface text-white shadow-lg sticky top-0 z-50 border-b border-transparent dark:border-dark-border transition-colors"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold whitespace-nowrap mr-4">
              Signal Works Design
            </Link>

            {isHomePage && (
              <div className="hidden md:flex items-center">
                {GROUPS.map((group) => (
                  <div key={group.key} className="relative">
                    <button
                      onClick={() => toggle(group.key)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-dark-hover transition"
                    >
                      {group.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${openDropdown === group.key ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {openDropdown === group.key && (
                      <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-100 dark:border-dark-border py-1.5 min-w-52 z-50">
                        {group.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-hover transition group"
                          >
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </span>
                            {item.desc && (
                              <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {item.desc}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <a
                  href="#contact"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-dark-hover transition"
                >
                  {t('nav.contact')}
                </a>
              </div>
            )}
          </div>

          {/* Right: language + theme + mobile toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-indigo-700 dark:bg-dark-card hover:bg-indigo-800 dark:hover:bg-dark-hover transition"
              aria-label="Toggle language"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-medium text-sm">{ja ? '日本語' : 'EN'}</span>
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

      {/* Mobile menu — flat list of all links */}
      {isHomePage && menuOpen && (
        <div className="md:hidden bg-indigo-700 dark:bg-dark-card border-t border-indigo-500 dark:border-dark-border">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
            {GROUPS.map((group) => (
              <div key={group.key}>
                <p className="px-3 pt-3 pb-1 text-xs font-semibold text-indigo-300 dark:text-gray-500 uppercase tracking-wider">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-md hover:bg-indigo-600 dark:hover:bg-dark-hover transition text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md hover:bg-indigo-600 dark:hover:bg-dark-hover transition text-sm font-medium mt-1"
            >
              {t('nav.contact')}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
