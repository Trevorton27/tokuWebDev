'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Props {
  children: ReactNode;
}

export default function OnboardingCheck({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasCompletedIntake, setHasCompletedIntake] = useState<boolean | null>(null);
  const [hasRoadmap, setHasRoadmap] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const [intakeRes, roadmapRes] = await Promise.all([
          axios.get('/api/assessment/intake/summary'),
          axios.get('/api/roadmap?summary=true'),
        ]);

        const completedIntake = intakeRes.data.success && intakeRes.data.data.hasCompletedIntake;
        const hasRoadmapItems = roadmapRes.data.success &&
          roadmapRes.data.data.summary &&
          roadmapRes.data.data.summary.totalItems > 0;

        setHasCompletedIntake(completedIntake);
        setHasRoadmap(hasRoadmapItems);

        // Show modal if either assessment not completed or no roadmap
        if (!completedIntake || !hasRoadmapItems) {
          setShowModal(true);
        }
      } catch (err) {
        // If there's an error, assume onboarding is not complete
        setHasCompletedIntake(false);
        setHasRoadmap(false);
        setShowModal(true);
        console.error('Failed to check onboarding status', err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Onboarding Modal */}
      {showModal && (!hasCompletedIntake || !hasRoadmap) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 pt-8 pb-16">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {!hasCompletedIntake ? 'Welcome to TokuWebDev!' : 'Generate Your Roadmap'}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 -mt-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <p className="text-gray-600 text-center mb-6">
                    {!hasCompletedIntake ? (
                      <>
                        Take a quick skill assessment to help us understand your current level
                        and create a <span className="font-semibold text-indigo-600">personalized learning roadmap</span> just for you.
                      </>
                    ) : (
                      <>
                        You've completed the assessment! Now let's generate your
                        <span className="font-semibold text-indigo-600"> personalized learning roadmap</span> based on your skills.
                      </>
                    )}
                  </p>

                  {/* Benefits list */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Identify your strengths and areas to improve</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Get a customized learning path</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Track your progress toward your goals</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link
                      href={!hasCompletedIntake ? '/assessment/intake' : '/student/roadmap'}
                      className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-center hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30"
                    >
                      {!hasCompletedIntake ? 'Start Assessment (~15 min)' : 'View Roadmap'}
                    </Link>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 font-medium text-center transition"
                    >
                      I'll do this later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
