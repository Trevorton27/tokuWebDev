import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    
    if (user.role === 'STUDENT') {
         return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const pendingRequests = await prisma.codeReviewRequest.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_REVIEW']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for queue
      }
    });

    return NextResponse.json({ success: true, data: pendingRequests });
  } catch (error) {
    console.error('Failed to fetch pending reviews:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
