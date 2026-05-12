'use client';

import { useEffect, useState } from 'react';
import assessmentClient from '@/lib/assessmentClient';
import type { Challenge } from '@/lib/types';

interface ChallengeListProps {
  onSelectChallenge?: (challenge: Challenge) => void;
}

export default function ChallengeList({ onSelectChallenge }: ChallengeListProps) {
  const [recommended, setRecommended] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function loadChallenges() {
      try {
        const [recommendedData, allData] = await Promise.all([
          assessmentClient.getRecommendedChallenges(5),
          assessmentClient.getChallenges(),
        ]);
        setRecommended(recommendedData);
        setAllChallenges(allData);
      } catch (err) {
        console.error('Failed to load challenges:', err);
      } finally {
        setLoading(false);
      }
    }

    loadChallenges();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading challenges...</div>;
  }

  const displayChallenges = showAll ? allChallenges : recommended;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {showAll ? 'All Challenges' : 'Recommended for You'}
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {showAll ? 'Show Recommended' : 'Show All'}
        </button>
      </div>

      <div className="space-y-3">
        {displayChallenges.map((challenge) => (
          <div
            key={challenge.id}
            onClick={() => onSelectChallenge?.(challenge)}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      challenge.difficulty === 'BEGINNER'
                        ? 'bg-green-100 text-green-700'
                        : challenge.difficulty === 'INTERMEDIATE'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {challenge.language}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
