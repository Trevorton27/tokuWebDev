import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { generateRecommendations } from '@/server/assessment/recommendationEngine';
import {
  RecommendationRequest,
  RecommendationResponse,
  StudentProfile,
} from '@/server/assessment/projectRecommendation';

/**
 * POST /api/assessment/projects/recommend
 *
 * Generate personalized project recommendations based on student profile.
 *
 * Request Body:
 * {
 *   profile: {
 *     interests: string[];
 *     assessmentScores: { [skill: string]: number };
 *     goals: { shortTerm: string; mediumTerm: string; longTerm: string };
 *   },
 *   count?: number;  // Optional: number of projects (default: 5)
 *   minDifficulty?: number;  // Optional: minimum difficulty (default: 1)
 *   maxDifficulty?: number;  // Optional: maximum difficulty (default: 5)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   projects: ProjectRecommendation[],
 *   metadata: {
 *     generatedAt: string;
 *     skillsAnalyzed: number;
 *     interestsMatched: number;
 *   }
 * }
 *
 * @example
 * POST /api/assessment/projects/recommend
 * {
 *   "profile": {
 *     "interests": ["web-development", "react"],
 *     "assessmentScores": {
 *       "js_basics": 0.75,
 *       "react_basics": 0.45,
 *       "node_basics": 0.30
 *     },
 *     "goals": {
 *       "shortTerm": "Build my first full-stack app",
 *       "mediumTerm": "Get a junior developer job",
 *       "longTerm": "Become a senior engineer"
 *     }
 *   },
 *   "count": 5
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = (await request.json()) as RecommendationRequest;

    // Validate required fields
    if (!body.profile) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: profile' },
        { status: 400 }
      );
    }

    const { profile, count = 5, minDifficulty = 1, maxDifficulty = 5 } = body;

    // Validate profile structure
    const validationError = validateProfile(profile);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Generate recommendations
    logger.info('Generating project recommendations', {
      userId: user.id,
      interestCount: profile.interests.length,
      skillCount: Object.keys(profile.assessmentScores).length,
    });

    const recommendations = generateRecommendations(profile, count);

    // Filter by difficulty range if specified
    const filteredRecommendations = recommendations.filter(
      (project) => project.difficulty >= minDifficulty && project.difficulty <= maxDifficulty
    );

    // Count how many interests were matched
    const interestsMatched = new Set(
      filteredRecommendations.flatMap((p) => p.alignedInterests)
    ).size;

    // Build response
    const response: RecommendationResponse = {
      success: true,
      projects: filteredRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        skillsAnalyzed: Object.keys(profile.assessmentScores).length,
        interestsMatched,
      },
    };

    logger.info('Project recommendations generated successfully', {
      userId: user.id,
      projectCount: filteredRecommendations.length,
      interestsMatched,
    });

    return NextResponse.json(response);
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle other errors
    logger.error('POST /api/assessment/projects/recommend failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate project recommendations',
      },
      { status: 500 }
    );
  }
}

/**
 * Validate Student Profile
 *
 * Ensures the profile has all required fields with correct types.
 *
 * @param profile - Student profile to validate
 * @returns Error message if invalid, null if valid
 */
function validateProfile(profile: StudentProfile): string | null {
  // Check interests
  if (!Array.isArray(profile.interests)) {
    return 'profile.interests must be an array';
  }

  // Check assessmentScores
  if (!profile.assessmentScores || typeof profile.assessmentScores !== 'object') {
    return 'profile.assessmentScores must be an object';
  }

  // Validate score values (should be numbers between 0 and 1)
  for (const [skill, score] of Object.entries(profile.assessmentScores)) {
    if (typeof score !== 'number' || score < 0 || score > 1) {
      return `assessmentScores.${skill} must be a number between 0 and 1`;
    }
  }

  // Check goals
  if (!profile.goals || typeof profile.goals !== 'object') {
    return 'profile.goals must be an object';
  }

  const { shortTerm, mediumTerm, longTerm } = profile.goals;

  if (typeof shortTerm !== 'string') {
    return 'profile.goals.shortTerm must be a string';
  }

  if (typeof mediumTerm !== 'string') {
    return 'profile.goals.mediumTerm must be a string';
  }

  if (typeof longTerm !== 'string') {
    return 'profile.goals.longTerm must be a string';
  }

  // All validation passed
  return null;
}

/**
 * GET /api/assessment/projects/recommend
 *
 * Get project recommendations for the authenticated user using their stored profile data.
 * This endpoint automatically fetches the user's interests, assessment scores, and goals
 * from the database.
 *
 * Query Parameters:
 * - count: number of projects to recommend (default: 5)
 * - minDifficulty: minimum difficulty level (default: 1)
 * - maxDifficulty: maximum difficulty level (default: 5)
 *
 * @example
 * GET /api/assessment/projects/recommend?count=5
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '5', 10);
    const minDifficulty = parseInt(searchParams.get('minDifficulty') || '1', 10);
    const maxDifficulty = parseInt(searchParams.get('maxDifficulty') || '5', 10);

    // Fetch user profile data from database
    const profile = await fetchUserProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'User profile not found. Please complete the assessment first.',
        },
        { status: 404 }
      );
    }

    // Generate recommendations
    logger.info('Generating project recommendations from user profile', {
      userId: user.id,
      interestCount: profile.interests.length,
      skillCount: Object.keys(profile.assessmentScores).length,
    });

    const recommendations = generateRecommendations(profile, count);

    // Filter by difficulty range
    const filteredRecommendations = recommendations.filter(
      (project) => project.difficulty >= minDifficulty && project.difficulty <= maxDifficulty
    );

    // Count matched interests
    const interestsMatched = new Set(
      filteredRecommendations.flatMap((p) => p.alignedInterests)
    ).size;

    // Build response
    const response: RecommendationResponse = {
      success: true,
      projects: filteredRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        skillsAnalyzed: Object.keys(profile.assessmentScores).length,
        interestsMatched,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.error('GET /api/assessment/projects/recommend failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate project recommendations',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch User Profile
 *
 * Retrieves user's interests, assessment scores, and goals from the database.
 *
 * @param userId - Database user ID
 * @returns StudentProfile or null if not found/incomplete
 */
async function fetchUserProfile(userId: string): Promise<StudentProfile | null> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interests: true,
        shortTermGoal: true,
        mediumTermGoal: true,
        longTermGoal: true,
      },
    });

    if (!user) {
      return null;
    }

    // Fetch skill mastery scores
    const skillMasteries = await prisma.userSkillMastery.findMany({
      where: { userId },
      select: {
        skillKey: true,
        mastery: true,
      },
    });

    // Build assessment scores map
    const assessmentScores: { [skillKey: string]: number } = {};
    for (const skill of skillMasteries) {
      assessmentScores[skill.skillKey] = skill.mastery;
    }

    // Check if profile is complete enough
    if (
      Object.keys(assessmentScores).length === 0 ||
      (!user.shortTermGoal && !user.mediumTermGoal && !user.longTermGoal)
    ) {
      return null;
    }

    // Build profile
    const profile: StudentProfile = {
      interests: user.interests || [],
      assessmentScores,
      goals: {
        shortTerm: user.shortTermGoal || '',
        mediumTerm: user.mediumTermGoal || '',
        longTerm: user.longTermGoal || '',
      },
    };

    return profile;
  } finally {
    await prisma.$disconnect();
  }
}
