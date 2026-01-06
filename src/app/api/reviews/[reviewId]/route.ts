import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'COMPLETED', 'CLOSED', 'REJECTED']),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const user = await requireAuth();

    // Verify admin/instructor
    if (user.role === 'STUDENT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { status, feedback } = updateSchema.parse(body);

    const updatedReview = await prisma.codeReviewRequest.update({
      where: { id: params.reviewId },
      data: {
        status,
        feedback,
        reviewerId: user.id, // Assign current user as reviewer
      },
    });

    return NextResponse.json({ success: true, data: updatedReview });
  } catch (error) {
    console.error('Failed to update review request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: 'Failed to update request', details: errorMessage }, { status: 500 });
  }
}
