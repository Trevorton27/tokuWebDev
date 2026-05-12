/**
 * Client-side wrappers for Assessment API endpoints
 */

import axios from 'axios';
import type {
  Challenge,
  CodeExecutionResult,
  TestResult,
  ChallengeFilters,
  ApiResponse,
  TutorResponse,
  ChatMessage,
} from './types';

const api = axios.create({
  baseURL: '/api/assessment',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CHALLENGES
// ============================================

export async function getChallenges(filters?: ChallengeFilters): Promise<Challenge[]> {
  const response = await api.get<ApiResponse<Challenge[]>>('/challenges', {
    params: filters,
  });
  return response.data.data || [];
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const response = await api.get<ApiResponse<Challenge>>(`/challenges/${slug}`);
  return response.data.data || null;
}

export async function getRecommendedChallenges(limit = 10): Promise<Challenge[]> {
  const response = await api.get<ApiResponse<Challenge[]>>('/recommendations', {
    params: { limit },
  });
  return response.data.data || [];
}

// ============================================
// CODE EXECUTION
// ============================================

export interface RunCodeRequest {
  code: string;
  language: string;
  input?: string;
  challengeId?: string;
}

export async function runCode(request: RunCodeRequest): Promise<CodeExecutionResult> {
  const response = await api.post<ApiResponse<CodeExecutionResult>>('/run-code', request);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Code execution failed');
  }
  return response.data.data!;
}

export async function submitChallenge(
  challengeId: string,
  code: string,
  timeSpent: number,
  hintsUsed: number
): Promise<{ passed: boolean; score: number; testResults: TestResult[] }> {
  const response = await api.post<ApiResponse>('/mastery', {
    challengeId,
    code,
    timeSpent,
    hintsUsed,
  });
  return response.data.data;
}

// ============================================
// AI TUTOR
// ============================================

export async function chatWithTutor(
  challengeId: string,
  messages: ChatMessage[],
  userCode?: string
): Promise<TutorResponse> {
  const response = await api.post<ApiResponse<TutorResponse>>('/chat', {
    challengeId,
    messages,
    userCode,
  });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to get tutor response');
  }
  return response.data.data!;
}

export default {
  getChallenges,
  getChallengeBySlug,
  getRecommendedChallenges,
  runCode,
  submitChallenge,
  chatWithTutor,
};
