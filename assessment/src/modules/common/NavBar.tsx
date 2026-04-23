'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';

const LMS_URL = process.env.NEXT_PUBLIC_LMS_URL || '';

export default function NavBar() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav className="bg-indigo-600 dark:bg-dark-surface text-white shadow-lg sticky top-0 z-50 border-b border-transparent dark:border-dark-border transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Signal Works Design
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-indigo-700 dark:bg-dark-card hover:bg-indigo-800 dark:hover:bg-dark-hover transition"
              aria-label="Toggle language"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-medium">{language === 'en' ? 'EN' : '日本語'}</span>
            </button>

            <SignedIn>
              {LMS_URL && (
                <a
                  href={LMS_URL}
                  className="px-4 py-2 bg-white dark:bg-dark-card text-indigo-600 dark:text-white rounded-md hover:bg-indigo-50 dark:hover:bg-dark-hover transition font-medium text-sm"
                >
                  My Dashboard
                </a>
              )}
              <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} />
            </SignedIn>

            <SignedOut>
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-white dark:bg-dark-card text-indigo-600 dark:text-white rounded-md hover:bg-indigo-50 dark:hover:bg-dark-hover transition font-medium"
              >
                Sign In
              </Link>
            </SignedOut>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
