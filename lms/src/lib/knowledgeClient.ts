/**
 * Client-side wrappers for Knowledge RAG API endpoints
 */

import axios from 'axios';
import type { SearchResult, KnowledgeSearchFilters, ApiResponse } from './types';

const api = axios.create({
  baseURL: '/api/knowledge',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// SEARCH
// ============================================

export interface SearchRequest {
  query: string;
  filters?: KnowledgeSearchFilters;
  limit?: number;
}

export async function searchKnowledge(request: SearchRequest): Promise<SearchResult[]> {
  const response = await api.post<ApiResponse<SearchResult[]>>('/search', request);
  return response.data.data || [];
}

// ============================================
// INGEST (Admin only)
// ============================================

export interface IngestRequest {
  title: string;
  content: string;
  type: 'LESSON' | 'DOCUMENTATION' | 'SOLUTION' | 'ARTICLE';
  sourceUrl?: string;
  metadata?: Record<string, any>;
}

export async function ingestDocument(request: IngestRequest): Promise<{ documentId: string }> {
  const response = await api.post<ApiResponse<{ documentId: string }>>('/ingest', request);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Document ingestion failed');
  }
  return response.data.data!;
}

export default {
  searchKnowledge,
  ingestDocument,
};
