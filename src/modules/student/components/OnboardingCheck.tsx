'use client';

import { ReactNode } from 'react';

/**
 * OnboardingCheck Component
 *
 * Simple wrapper component that was previously used for onboarding modals.
 * Now simplified to just render children without any modal popups.
 *
 * Students can access roadmap at /roadmap and assessment at /assessment independently.
 */

interface Props {
  children: ReactNode;
}

export default function OnboardingCheck({ children }: Props) {
  // Simply render children without any onboarding checks or modals
  // Roadmap and assessment are now decoupled and accessible via direct routes
  return <>{children}</>;
}
