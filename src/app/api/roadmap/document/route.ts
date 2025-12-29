/**
 * API Route: Fetch Student Roadmap from Google Docs
 * GET /api/roadmap/document
 * Returns the roadmap document content in HTML format
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGoogleDoc, convertGoogleDocToHTML } from '@/lib/googleDocs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and get current user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database with roadmapDocumentId
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { roadmapDocumentId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if student has a roadmap document assigned
    if (!user.roadmapDocumentId) {
      return NextResponse.json(
        {
          error: 'No roadmap document assigned',
          message: 'Please contact your instructor to have a roadmap document assigned to your account.'
        },
        { status: 404 }
      );
    }

    // Fetch the Google Doc
    const doc = await getGoogleDoc(user.roadmapDocumentId);

    // Convert to HTML
    const html = convertGoogleDocToHTML(doc);

    return NextResponse.json({
      success: true,
      title: doc.title || 'Student Roadmap',
      content: html,
      documentId: user.roadmapDocumentId,
      lastModified: doc.revisionId,
    });
  } catch (error: any) {
    console.error('Error fetching roadmap document:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch roadmap document',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
