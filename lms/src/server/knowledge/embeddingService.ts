/**
 * Embedding service - Generate vector embeddings via Voyage AI
 * Note: Anthropic does not provide embeddings, so we use Voyage AI as recommended partner
 */

import axios from 'axios';
import { logger } from '@/lib/logger';

const EMBEDDINGS_API_KEY = process.env.EMBEDDINGS_API_KEY || '';
const EMBEDDINGS_API_URL =
  process.env.EMBEDDINGS_API_URL || 'https://api.voyageai.com/v1/embeddings';
const EMBEDDINGS_MODEL = process.env.EMBEDDINGS_MODEL || 'voyage-2';

const EMBEDDING_DIMENSIONS = 1024; // voyage-2 produces 1024-dimensional embeddings

/**
 * Generate embedding for a single text
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!EMBEDDINGS_API_KEY) {
      logger.warn('Embeddings API key not configured, using mock embedding');
      return generateMockEmbedding();
    }

    const response = await axios.post(
      EMBEDDINGS_API_URL,
      {
        model: EMBEDDINGS_MODEL,
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${EMBEDDINGS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embedding = response.data.data[0].embedding;

    if (!validateEmbedding(embedding)) {
      throw new Error('Invalid embedding format');
    }

    return embedding;
  } catch (error) {
    logger.error('Failed to generate embedding', error);

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Embedding API error: ${error.response.data.error?.message || 'Unknown error'}`
      );
    }

    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function batchGetEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    if (!EMBEDDINGS_API_KEY) {
      logger.warn('Embeddings API key not configured, using mock embeddings');
      return texts.map(() => generateMockEmbedding());
    }

    // Voyage AI supports batching
    const response = await axios.post(
      EMBEDDINGS_API_URL,
      {
        model: EMBEDDINGS_MODEL,
        input: texts,
      },
      {
        headers: {
          Authorization: `Bearer ${EMBEDDINGS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const embeddings = response.data.data.map((item: any) => item.embedding);

    return embeddings;
  } catch (error) {
    logger.error('Failed to generate batch embeddings', error, { count: texts.length });
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Validate embedding format
 */
export function validateEmbedding(embedding: number[]): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSIONS &&
    embedding.every((val) => typeof val === 'number' && !isNaN(val))
  );
}

/**
 * Generate mock embedding for development/testing
 */
function generateMockEmbedding(): number[] {
  // Generate random normalized vector
  const embedding = Array.from({ length: EMBEDDING_DIMENSIONS }, () => Math.random() * 2 - 1);

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
}
