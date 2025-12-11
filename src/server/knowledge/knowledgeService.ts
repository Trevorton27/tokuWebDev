/**
 * Knowledge service - Document indexing and semantic search
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Document, SearchResult, KnowledgeSearchFilters } from '@/lib/types';
import { getEmbedding, batchGetEmbeddings } from './embeddingService';
import { DocumentType } from '@prisma/client';

const DEFAULT_CHUNK_SIZE = 500; // tokens (approximate by words)
const CHUNK_OVERLAP = 50;

/**
 * Index a document by chunking and generating embeddings
 */
export async function indexDocument(data: {
  title: string;
  content: string;
  type: DocumentType;
  sourceUrl?: string;
  metadata?: any;
}): Promise<Document> {
  try {
    // 1. Create document record
    const document = await prisma.document.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        sourceUrl: data.sourceUrl,
        metadata: data.metadata,
      },
    });

    // 2. Chunk the content
    const chunks = chunkDocument(data.content);

    // 3. Generate embeddings for chunks
    const embeddings = await batchGetEmbeddings(chunks.map((c) => c.content));

    // 4. Store chunks with embeddings
    await Promise.all(
      chunks.map((chunk, index) =>
        prisma.documentChunk.create({
          data: {
            documentId: document.id,
            content: chunk.content,
            chunkIndex: index,
            embedding: embeddings[index],
            metadata: chunk.metadata,
          },
        })
      )
    );

    logger.info('Document indexed', {
      documentId: document.id,
      chunks: chunks.length,
      title: data.title,
    });

    return document;
  } catch (error) {
    logger.error('Failed to index document', error, { title: data.title });
    throw new Error('Failed to index document');
  }
}

/**
 * Chunk document into smaller pieces
 */
function chunkDocument(
  content: string,
  maxChunkSize = DEFAULT_CHUNK_SIZE
): Array<{ content: string; metadata?: any }> {
  // Simple word-based chunking
  const words = content.split(/\s+/);
  const chunks: Array<{ content: string; metadata?: any }> = [];

  for (let i = 0; i < words.length; i += maxChunkSize - CHUNK_OVERLAP) {
    const chunkWords = words.slice(i, i + maxChunkSize);
    const chunkContent = chunkWords.join(' ');

    chunks.push({
      content: chunkContent,
      metadata: {
        startWord: i,
        endWord: i + chunkWords.length,
      },
    });
  }

  return chunks.length > 0 ? chunks : [{ content }];
}

/**
 * Semantic search using vector similarity
 */
export async function searchKnowledge(
  query: string,
  filters?: KnowledgeSearchFilters & { tags?: string[]; limit?: number }
): Promise<SearchResult[]> {
  try {
    // 1. Generate query embedding
    const queryEmbedding = await getEmbedding(query);

    // 2. Build filter conditions
    const whereConditions: any = {};

    if (filters?.type && filters.type.length > 0) {
      whereConditions.document = {
        type: { in: filters.type },
      };
    }

    // 3. Get all chunks (in production, use vector DB with similarity search)
    // For now, we'll do a simple cosine similarity calculation in memory
    const allChunks = await prisma.documentChunk.findMany({
      where: whereConditions,
      include: {
        document: {
          select: {
            id: true,
            title: true,
            type: true,
            sourceUrl: true,
          },
        },
      },
      take: 1000, // Limit to prevent memory issues
    });

    // 4. Calculate cosine similarity for each chunk
    const results = allChunks
      .map((chunk) => ({
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
        metadata: {
          documentId: chunk.document.id,
          title: chunk.document.title,
          type: chunk.document.type,
          sourceUrl: chunk.document.sourceUrl,
        },
      }))
      .filter((result) => result.score >= (filters?.minScore || 0.7))
      .sort((a, b) => b.score - a.score)
      .slice(0, filters?.limit || 5);

    logger.info('Knowledge search completed', {
      query,
      results: results.length,
      filters,
    });

    return results;
  } catch (error) {
    logger.error('Knowledge search failed', error, { query });
    return [];
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Update document and re-index
 */
export async function updateDocument(documentId: string, content: string): Promise<Document> {
  try {
    // Delete old chunks
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    });

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: { content },
    });

    // Re-chunk and re-index
    const chunks = chunkDocument(content);
    const embeddings = await batchGetEmbeddings(chunks.map((c) => c.content));

    await Promise.all(
      chunks.map((chunk, index) =>
        prisma.documentChunk.create({
          data: {
            documentId,
            content: chunk.content,
            chunkIndex: index,
            embedding: embeddings[index],
            metadata: chunk.metadata,
          },
        })
      )
    );

    logger.info('Document updated and re-indexed', { documentId });
    return document;
  } catch (error) {
    logger.error('Failed to update document', error, { documentId });
    throw new Error('Failed to update document');
  }
}

/**
 * Delete document and all chunks
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    await prisma.document.delete({
      where: { id: documentId },
    });

    logger.info('Document deleted', { documentId });
  } catch (error) {
    logger.error('Failed to delete document', error, { documentId });
    throw new Error('Failed to delete document');
  }
}

/**
 * Get RAG context chunks for a specific lesson
 * Useful for providing lesson-specific context to the AI tutor
 */
export async function getLessonContextChunks(lessonId: string, limit = 8) {
  try {
    const documents = await prisma.document.findMany({
      where: { lessonId },
      include: { chunks: true },
    });

    // Flatten all chunks from all documents
    const allChunks = documents.flatMap((d: any) => d.chunks ?? []);

    logger.info('Retrieved lesson context chunks', {
      lessonId,
      documentCount: documents.length,
      chunkCount: allChunks.length,
      returned: Math.min(limit, allChunks.length),
    });

    // Return first N chunks (naive approach - can be improved with relevance scoring)
    return allChunks.slice(0, limit);
  } catch (error) {
    logger.error('Failed to get lesson context chunks', error, { lessonId });
    return [];
  }
}
