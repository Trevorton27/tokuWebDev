import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  projectId: z.string().optional(),
  repoUrl: z.string().url(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { projectId, repoUrl, notes } = requestSchema.parse(body);

    const reviewRequest = await prisma.codeReviewRequest.create({
      data: {
        userId: user.id,
        projectId,
        repoUrl,
        notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: reviewRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    console.error('Failed to create review request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: 'Failed to create request', details: errorMessage }, { status: 500 });
  }
}
