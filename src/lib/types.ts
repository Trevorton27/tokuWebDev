/**
 * Shared TypeScript types and interfaces
 */

import { Difficulty, Language, DocumentType, MasteryEventType, Role } from '@prisma/client';

// ============================================
// LMS DOMAIN TYPES
// ============================================

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  instructorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  videoUrl?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
}

// ============================================
// ASSESSMENT DOMAIN TYPES
// ============================================

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  starterCode: string;
  solution: string;
  tags: string[];
  hints: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  challengeId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
}

export interface Attempt {
  id: string;
  userId: string;
  challengeId: string;
  code: string;
  passed: boolean;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  attemptedAt: Date;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  executionTime: number;
  memory?: number;
  error?: string;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
}

export interface MasteryProfile {
  userId: string;
  skills: {
    [skillTag: string]: {
      proficiency: number; // 0-100
      attempts: number;
      successes: number;
      lastAttempt: Date;
    };
  };
}

// ============================================
// SKILL MODEL TYPES
// ============================================

export type SkillDimension =
  | 'programming_fundamentals'
  | 'web_foundations'
  | 'javascript'
  | 'backend'
  | 'dev_practices'
  | 'system_thinking'
  | 'design'
  | 'meta';

export interface SkillMasteryData {
  mastery: number; // 0-1
  confidence: number; // 0-1
  attempts: number;
}

export interface SkillProfile {
  userId: string;
  skills: Record<string, SkillMasteryData>;
  dimensions: Record<SkillDimension, {
    score: number; // 0-1 aggregate
    confidence: number; // 0-1 aggregate
    skillCount: number;
    assessedCount: number;
  }>;
  lastUpdated: Date;
}

export interface SkillProfileSummary {
  dimensions: Array<{
    key: SkillDimension;
    label: string;
    score: number;
    confidence: number;
    assessedRatio: number;
  }>;
  overallScore: number;
  overallConfidence: number;
  totalSkillsAssessed: number;
  totalSkills: number;
}

// ============================================
// KNOWLEDGE RAG TYPES
// ============================================

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  sourceUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  content: string;
  score: number;
  metadata: {
    documentId: string;
    title: string;
    type: DocumentType;
    sourceUrl?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TutorResponse {
  reply: string;
  sources: {
    title: string;
    url?: string;
    type: DocumentType;
  }[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FILTER TYPES
// ============================================

export interface ChallengeFilters {
  difficulty?: Difficulty[];
  language?: Language[];
  tags?: string[];
  search?: string;
}

export interface KnowledgeSearchFilters {
  type?: DocumentType[];
  tags?: string[];
  minScore?: number;
}

// Re-export Prisma enums for convenience
export { Difficulty, Language, DocumentType, MasteryEventType, Role };
