import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/server/knowledge/knowledgeService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, limit } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await searchKnowledge(query, {
      ...filters,
      limit: limit || 5,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('POST /api/knowledge/search failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}
