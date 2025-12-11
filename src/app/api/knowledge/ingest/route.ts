import { NextRequest, NextResponse } from 'next/server';
import { indexDocument } from '@/server/knowledge/knowledgeService';
import { requireRole } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { DocumentType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Only admins and instructors can ingest documents
    await requireRole(['ADMIN', 'INSTRUCTOR']);

    const body = await request.json();
    const { title, content, type, sourceUrl, metadata } = body;

    if (!title || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Validate document type
    if (!Object.values(DocumentType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      );
    }

    const document = await indexDocument({
      title,
      content,
      type,
      sourceUrl,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: { documentId: document.id },
    });
  } catch (error) {
    logger.error('POST /api/knowledge/ingest failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ingest document' },
      { status: 500 }
    );
  }
}
