/**
 * Client-side wrappers for Intake Assessment API endpoints
 */

import axios from 'axios';
import type { ApiResponse, SkillProfileSummary } from './types';
import type { IntakeStepConfig } from '@/server/assessment/intakeConfig';

const api = axios.create({
  baseURL: '/api/assessment/intake',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// TYPES
// ============================================

export interface StartSessionResponse {
  sessionId: string;
  firstStep: IntakeStepConfig;
  totalSteps: number;
  estimatedMinutes: number;
  isResuming: boolean;
}

export interface CurrentStepResponse {
  step: IntakeStepConfig;
  progress: number;
  previousAnswer?: any;
  canGoBack: boolean;
}

export interface GradeResult {
  score: number;
  passed: boolean;
  feedback?: string;
  details?: Record<string, any>;
}

export interface SubmitAnswerResponse {
  gradeResult: GradeResult;
  skillUpdates: Array<{ skillKey: string; delta: number }>;
  nextStep: IntakeStepConfig | null;
  isComplete: boolean;
  progress: number;
}

export interface SessionSummaryResponse {
  hasCompletedIntake: boolean;
  latestSession: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
  } | null;
  profileSummary: SkillProfileSummary;
}

export interface AssessmentSummary {
  skillProfile: {
    dimensions: Array<{
      dimension: string;
      mastery: number;
      confidence: number;
    }>;
    overallMastery: number;
  };
  recommendations: string[];
  nextSteps?: string[];
}

function generateRecommendations(profileSummary: SkillProfileSummary): string[] {
  const recommendations: string[] = [];
  const weakAreas = profileSummary.dimensions
    .filter((d) => d.score < 0.4)
    .sort((a, b) => a.score - b.score);

  if (weakAreas.length > 0) {
    recommendations.push(`Focus on strengthening your ${weakAreas[0].label} skills first`);
  }

  const lowConfidence = profileSummary.dimensions.filter(
    (d) => d.confidence < 0.3 && d.assessedRatio < 0.5
  );
  if (lowConfidence.length > 0) {
    recommendations.push(
      `Complete more assessments in ${lowConfidence.map((d) => d.label).join(', ')} to get a better skill estimate`
    );
  }

  if (profileSummary.overallScore >= 0.6) {
    recommendations.push('You have a solid foundation - consider tackling more advanced projects');
  } else {
    recommendations.push('Start with the fundamentals and build up your skills progressively');
  }

  return recommendations;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Start or resume an intake assessment session
 */
export async function startIntakeSession(): Promise<StartSessionResponse> {
  const response = await api.post<ApiResponse<StartSessionResponse>>('/start');
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to start session');
  }
  return response.data.data!;
}

/**
 * Get the current step in a session
 */
export async function getCurrentStep(sessionId: string): Promise<CurrentStepResponse> {
  const response = await api.get<ApiResponse<CurrentStepResponse>>('/current', {
    params: { sessionId },
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to get current step');
  }
  return response.data.data!;
}

/**
 * Go back to previous step
 */
export async function goBack(sessionId: string): Promise<CurrentStepResponse> {
  const response = await api.post<ApiResponse<CurrentStepResponse>>('/current', {
    sessionId,
    action: 'back',
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to go back');
  }
  return response.data.data!;
}

/**
 * Submit an answer for the current step
 */
export async function submitStepAnswer(
  sessionId: string,
  stepId: string,
  answer: any
): Promise<SubmitAnswerResponse> {
  const response = await api.post<ApiResponse<SubmitAnswerResponse>>('/submit', {
    sessionId,
    stepId,
    answer,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to submit answer');
  }
  return response.data.data!;
}

/**
 * Get session summary (or check if intake is completed)
 */
export async function getIntakeSummary(sessionId?: string): Promise<SessionSummaryResponse> {
  const response = await api.get<ApiResponse<SessionSummaryResponse>>('/summary', {
    params: sessionId ? { sessionId } : {},
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to get summary');
  }
  return response.data.data!;
}

/**
 * Get the full assessment summary with skill profile and recommendations
 */
export async function getAssessmentSummary(): Promise<AssessmentSummary> {
  const response = await api.get<ApiResponse<SessionSummaryResponse>>('/summary');
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to get assessment summary');
  }

  const data = response.data.data!;
  const profileSummary = data.profileSummary;

  // Transform the profile summary into the AssessmentSummary format
  const dimensions = profileSummary?.dimensions?.map((d) => ({
    dimension: d.label,
    mastery: d.score,
    confidence: d.confidence,
  })) || [];

  return {
    skillProfile: {
      dimensions,
      overallMastery: profileSummary?.overallScore || 0,
    },
    recommendations: generateRecommendations(profileSummary),
    nextSteps: [],
  };
}

export default {
  startIntakeSession,
  getCurrentStep,
  goBack,
  submitStepAnswer,
  getIntakeSummary,
  getAssessmentSummary,
};
