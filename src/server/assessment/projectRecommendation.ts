/**
 * Project Recommendation System
 *
 * This module provides types and logic for generating personalized project recommendations
 * based on a student's interests, assessment scores, and learning goals.
 *
 * The recommendation engine analyzes:
 * - Student interests (tags/topics they care about)
 * - Assessment scores (skill mastery levels across multiple dimensions)
 * - Learning goals (short, medium, and long-term objectives)
 *
 * It then generates 5 tailored project suggestions that:
 * - Progress in difficulty for growth trajectory
 * - Cover weak skill areas without overwhelming
 * - Align with stated interests
 * - Connect to goal horizons
 * - Avoid trivial CRUD clones
 *
 * @module server/assessment/projectRecommendation
 */

/**
 * Student Profile Input
 *
 * Represents the complete student profile used for generating recommendations.
 * This data is collected from:
 * - User.interests field (from onboarding or profile updates)
 * - UserSkillMastery records (from assessment grading)
 * - User goal fields (from assessment questionnaire)
 */
export interface StudentProfile {
  /**
   * Array of interest tags (e.g., ["web-development", "machine-learning", "game-dev"])
   * Used to align projects with topics the student cares about
   */
  interests: string[];

  /**
   * Map of skill keys to mastery scores (0.0 to 1.0)
   * Example: { "js_basics": 0.75, "react": 0.45, "node": 0.30 }
   * Lower scores indicate skill gaps that projects should address
   */
  assessmentScores: { [skillKey: string]: number };

  /**
   * Student's learning goals across different time horizons
   * Used to ensure recommended projects tie to concrete objectives
   */
  goals: {
    /** Short-term goal (e.g., "Build first full-stack app", "Land freelance gig") */
    shortTerm: string;
    /** Medium-term goal (e.g., "Get junior dev job", "Master React ecosystem") */
    mediumTerm: string;
    /** Long-term goal (e.g., "Become senior engineer", "Start tech company") */
    longTerm: string;
  };
}

/**
 * Project Recommendation Output
 *
 * Represents a single recommended project with all necessary details
 * for a student to understand and execute the project.
 */
export interface ProjectRecommendation {
  /**
   * Project title
   * Should be clear, specific, and engaging
   * Example: "Real-time Chat App with WebSockets"
   */
  title: string;

  /**
   * Detailed project description (2-4 sentences)
   * Explains what the student will build and why it matters
   * Example: "Build a real-time chat application where users can join rooms..."
   */
  description: string;

  /**
   * Primary learning outcomes (3-5 bullet points)
   * What skills/concepts the student will learn or reinforce
   * Example: ["Master WebSocket communication", "Implement user authentication", ...]
   */
  learningOutcomes: string[];

  /**
   * Proposed tech stack (array of technologies)
   * Specific libraries, frameworks, tools to use
   * Example: ["React", "Node.js", "Socket.io", "MongoDB", "JWT"]
   */
  techStack: string[];

  /**
   * Concrete deliverables (3-5 items)
   * Specific features or artifacts the student should produce
   * Example: ["User login/signup system", "Real-time message broadcast", ...]
   */
  deliverables: string[];

  /**
   * Supporting concepts and resources to learn
   * Prerequisites, related topics, documentation links
   * Example: ["WebSocket protocol basics", "Event-driven architecture", ...]
   */
  supportingResources: string[];

  /**
   * Explanation of why this project was recommended
   * References student's interests, weak skills, and goals
   * Example: "This aligns with your interest in web-development and addresses..."
   */
  recommendationReason: string;

  /**
   * Difficulty level (1-5)
   * 1 = Beginner, 2 = Easy Intermediate, 3 = Intermediate,
   * 4 = Advanced Intermediate, 5 = Advanced
   * Used for ordering projects in growth trajectory
   */
  difficulty: number;

  /**
   * Which of the student's interests this project aligns with
   * Subset of StudentProfile.interests
   * Example: ["web-development", "real-time-systems"]
   */
  alignedInterests: string[];

  /**
   * Which goal horizon this project primarily addresses
   * One of: "short" | "medium" | "long"
   * Ensures coverage across all time horizons
   */
  goalHorizon: 'short' | 'medium' | 'long';

  /**
   * Which weak skill areas this project will strengthen
   * Subset of StudentProfile.assessmentScores keys
   * Example: ["websockets", "authentication", "state_management"]
   */
  targetedSkills: string[];
}

/**
 * Recommendation Request
 *
 * Input for the recommendation API endpoint
 */
export interface RecommendationRequest {
  /** Student's profile data */
  profile: StudentProfile;

  /** Optional: Number of projects to generate (default: 5) */
  count?: number;

  /** Optional: Minimum difficulty (default: 1) */
  minDifficulty?: number;

  /** Optional: Maximum difficulty (default: 5) */
  maxDifficulty?: number;
}

/**
 * Recommendation Response
 *
 * Output from the recommendation API endpoint
 */
export interface RecommendationResponse {
  /** Whether the request was successful */
  success: boolean;

  /** Array of recommended projects (ordered by difficulty) */
  projects?: ProjectRecommendation[];

  /** Error message if request failed */
  error?: string;

  /** Metadata about the recommendation generation */
  metadata?: {
    /** When the recommendations were generated */
    generatedAt: string;
    /** How many skills were analyzed */
    skillsAnalyzed: number;
    /** How many interests were matched */
    interestsMatched: number;
  };
}

/**
 * Skill Gap Analysis
 *
 * Internal type for analyzing which skills need strengthening
 */
export interface SkillGap {
  /** Skill key from the skill taxonomy */
  skillKey: string;
  /** Current mastery level (0.0 to 1.0) */
  currentMastery: number;
  /** How important this skill is (based on goals/interests) */
  priority: number;
  /** Dimension this skill belongs to (Programming, Web, etc.) */
  dimension: string;
}

/**
 * Project Template
 *
 * Internal type for project templates used by the recommendation engine
 * Templates are matched against student profiles to generate recommendations
 */
export interface ProjectTemplate {
  /** Template ID */
  id: string;
  /** Project title */
  title: string;
  /** Project description */
  description: string;
  /** Learning outcomes */
  learningOutcomes: string[];
  /** Tech stack */
  techStack: string[];
  /** Deliverables */
  deliverables: string[];
  /** Supporting resources */
  supportingResources: string[];
  /** Difficulty level (1-5) */
  difficulty: number;
  /** Related interest tags */
  relatedInterests: string[];
  /** Skills this project strengthens */
  skillsCovered: string[];
  /** Goal horizon this project best fits */
  goalHorizon: 'short' | 'medium' | 'long';
  /** Category (web, mobile, data, etc.) */
  category: string;
}

/**
 * Recommendation Weights
 *
 * Configuration for how much to weigh different factors in scoring
 */
export interface RecommendationWeights {
  /** Weight for interest alignment (0.0 to 1.0) */
  interestWeight: number;
  /** Weight for skill gap coverage (0.0 to 1.0) */
  skillGapWeight: number;
  /** Weight for goal alignment (0.0 to 1.0) */
  goalWeight: number;
  /** Weight for difficulty appropriateness (0.0 to 1.0) */
  difficultyWeight: number;
}
