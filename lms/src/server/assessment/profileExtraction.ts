/**
 * Profile Extraction Service
 *
 * Extracts student interests and goals from assessment responses
 * and persists them to the User model for project recommendations.
 *
 * @module server/assessment/profileExtraction
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Extract and Save Student Profile
 *
 * Analyzes all responses from an assessment session to extract:
 * - Learning goals (short, medium, long-term)
 * - Interests (based on questionnaire answers and project preferences)
 *
 * Saves these to the User model for use in project recommendations.
 *
 * @param userId - Database user ID
 * @param sessionId - Assessment session ID
 */
export async function extractAndSaveStudentProfile(
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    logger.info('Extracting student profile from assessment', { userId, sessionId });

    // Fetch all responses for this session
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Extract goals and interests from responses
    const { goals, interests } = extractProfileData(session.responses);

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        shortTermGoal: goals.shortTerm || undefined,
        mediumTermGoal: goals.mediumTerm || undefined,
        longTermGoal: goals.longTerm || undefined,
        interests: interests.length > 0 ? interests : undefined,
      },
    });

    logger.info('Student profile extracted and saved', {
      userId,
      sessionId,
      goalCount: [goals.shortTerm, goals.mediumTerm, goals.longTerm].filter(Boolean).length,
      interestCount: interests.length,
    });
  } catch (error) {
    logger.error('Failed to extract and save student profile', error, { userId, sessionId });
    // Don't throw - this is a non-critical enhancement
    // The assessment can complete successfully even if profile extraction fails
  }
}

/**
 * Extract Profile Data from Responses
 *
 * Parses assessment responses to extract goals and interests.
 *
 * Goals are extracted from questionnaire responses:
 * - learning_goal: Primary learning goal
 * - career_goals: Career aspirations
 * - time_commitment: Time horizon preferences
 * - learning_style: Learning preferences
 *
 * Interests are inferred from:
 * - Technology preferences
 * - Project type preferences
 * - Domain interests
 *
 * @param responses - Array of assessment responses
 * @returns Extracted goals and interests
 */
function extractProfileData(responses: any[]): {
  goals: {
    shortTerm: string | null;
    mediumTerm: string | null;
    longTerm: string | null;
  };
  interests: string[];
} {
  let shortTermGoal: string | null = null;
  let mediumTermGoal: string | null = null;
  let longTermGoal: string | null = null;
  const interestSet = new Set<string>();

  // Find questionnaire response
  const questionnaireResponse = responses.find(
    (r) => r.stepId === 'questionnaire_background' || r.stepKind === 'QUESTIONNAIRE'
  );

  if (questionnaireResponse && questionnaireResponse.rawAnswer) {
    const answers = questionnaireResponse.rawAnswer as Record<string, any>;

    // Extract learning goal
    const learningGoal = answers.learning_goal;
    if (learningGoal) {
      // Map learning goal to short/medium/long term
      switch (learningGoal) {
        case 'career_change':
          mediumTermGoal = 'Transition into a tech career';
          longTermGoal = 'Become a professional software engineer';
          interestSet.add('web-development');
          interestSet.add('full-stack');
          break;
        case 'skill_upgrade':
          shortTermGoal = 'Learn new technologies and frameworks';
          mediumTermGoal = 'Advance current technical skills';
          break;
        case 'freelance':
          shortTermGoal = 'Build portfolio projects';
          mediumTermGoal = 'Start freelancing';
          longTermGoal = 'Run a successful freelance business';
          interestSet.add('web-development');
          interestSet.add('full-stack');
          break;
        case 'side_projects':
          shortTermGoal = 'Build personal projects';
          mediumTermGoal = 'Create a portfolio of side projects';
          interestSet.add('web-development');
          interestSet.add('react');
          break;
        case 'startup':
          shortTermGoal = 'Build MVP';
          mediumTermGoal = 'Launch a product';
          longTermGoal = 'Build and scale a tech startup';
          interestSet.add('web-development');
          interestSet.add('full-stack');
          interestSet.add('saas');
          break;
        case 'curiosity':
          shortTermGoal = 'Learn programming fundamentals';
          mediumTermGoal = 'Build confidence with coding';
          break;
      }
    }

    // Extract experience level to infer interests
    const experienceLevel = answers.experience_level;
    if (experienceLevel === 'beginner') {
      interestSet.add('web-development');
      interestSet.add('javascript');
    }

    // Extract technology preferences if available
    const techInterests = answers.tech_interests || answers.interests;
    if (Array.isArray(techInterests)) {
      techInterests.forEach((interest: string) => interestSet.add(interest));
    } else if (typeof techInterests === 'string') {
      interestSet.add(techInterests);
    }

    // Extract project preferences
    const projectType = answers.project_preference || answers.preferred_projects;
    if (projectType) {
      switch (projectType) {
        case 'web_app':
          interestSet.add('web-development');
          interestSet.add('full-stack');
          break;
        case 'mobile_app':
          interestSet.add('mobile');
          interestSet.add('react-native');
          break;
        case 'api':
          interestSet.add('backend');
          interestSet.add('apis');
          break;
        case 'data':
          interestSet.add('data');
          interestSet.add('analytics');
          break;
        case 'game':
          interestSet.add('game-dev');
          interestSet.add('graphics');
          break;
      }
    }
  }

  // Fallback: If no specific goals extracted, create generic ones
  if (!shortTermGoal && !mediumTermGoal && !longTermGoal) {
    shortTermGoal = 'Build fundamental programming skills';
    mediumTermGoal = 'Create projects that showcase my abilities';
    longTermGoal = 'Advance my career in software development';
  }

  // Fallback: If no interests identified, add web-development (most common)
  if (interestSet.size === 0) {
    interestSet.add('web-development');
    interestSet.add('javascript');
  }

  return {
    goals: {
      shortTerm: shortTermGoal,
      mediumTerm: mediumTermGoal,
      longTerm: longTermGoal,
    },
    interests: Array.from(interestSet),
  };
}

/**
 * Get Student Profile for Recommendations
 *
 * Retrieves the student's complete profile needed for project recommendations.
 * This is a convenience function that combines User data with UserSkillMastery data.
 *
 * @param userId - Database user ID
 * @returns Student profile or null if incomplete
 */
export async function getStudentProfileForRecommendations(userId: string) {
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

    // Check if profile is complete enough for recommendations
    if (
      Object.keys(assessmentScores).length === 0 ||
      (!user.shortTermGoal && !user.mediumTermGoal && !user.longTermGoal)
    ) {
      return null;
    }

    return {
      interests: user.interests || [],
      assessmentScores,
      goals: {
        shortTerm: user.shortTermGoal || '',
        mediumTerm: user.mediumTermGoal || '',
        longTerm: user.longTermGoal || '',
      },
    };
  } catch (error) {
    logger.error('Failed to get student profile for recommendations', error, { userId });
    return null;
  }
}
