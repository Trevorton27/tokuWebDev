/**
 * API Route: Fetch Student Roadmap from Google Docs
 * GET /api/roadmap/document
 * Returns the roadmap document content in HTML format, or a documentId
 * for iframe fallback when the Google service account is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleDoc, convertGoogleDocToHTML } from '@/lib/googleDocs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  let documentId: string | null = null;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { roadmapDocumentId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.roadmapDocumentId) {
      return NextResponse.json(
        { error: 'No roadmap document assigned' },
        { status: 404 }
      );
    }

    documentId = user.roadmapDocumentId;

    // If Google service account credentials are missing, return the documentId
    // so the client can fall back to an iframe embed.
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ success: false, documentId });
    }

    const doc = await getGoogleDoc(documentId);
    const html = convertGoogleDocToHTML(doc);

    return NextResponse.json({
      success: true,
      title: doc.title || 'Student Roadmap',
      content: html,
      documentId,
      lastModified: doc.revisionId,
    });
  } catch (error: any) {
    console.error('Error fetching roadmap document:', error);

    return NextResponse.json(
      { success: false, documentId, error: 'Failed to fetch roadmap document' },
      { status: 500 }
    );
  }
}
