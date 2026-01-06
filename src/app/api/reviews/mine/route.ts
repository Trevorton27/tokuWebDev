import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const myReviews = await prisma.codeReviewRequest.findMany({
      where: {
        userId: user.id
      },
      include: {
        reviewer: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: myReviews });
  } catch (error) {
    console.error('Failed to fetch my reviews:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
