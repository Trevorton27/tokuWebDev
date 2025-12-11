'use client';

import { useState } from 'react';
import LayoutShell from '@/modules/common/LayoutShell';
import ChallengeList from '@/modules/assessment/ui/ChallengeList';
import ChallengeRunner from '@/modules/assessment/ui/ChallengeRunner';
import TutorChat from '@/modules/assessment/ui/TutorChat';
import RoadmapSidebar from '@/modules/assessment/ui/RoadmapSidebar';
import type { Challenge } from '@/lib/types';

export default function AssessmentPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  return (
    <LayoutShell
      title="AI-Powered Assessment"
      description="Practice coding with adaptive challenges and AI tutoring"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Challenge List */}
        <div className="lg:col-span-3">
          <ChallengeList onSelectChallenge={setSelectedChallenge} />
        </div>

        {/* Main Content - Challenge Runner */}
        <div className="lg:col-span-6">
          {selectedChallenge ? (
            <>
              <ChallengeRunner challenge={selectedChallenge} />
              <div className="mt-6">
                <TutorChat challengeId={selectedChallenge.id} />
              </div>
            </>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-gray-500">Select a challenge to get started</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Roadmap */}
        <div className="lg:col-span-3">
          <RoadmapSidebar />
        </div>
      </div>
    </LayoutShell>
  );
}
