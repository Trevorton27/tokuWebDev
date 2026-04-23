import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/enrollments/:enrollmentId - Update enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { enrolledAt, completedAt } = body;

    const updateData: any = {};

    if (enrolledAt !== undefined) {
      updateData.enrolledAt = enrolledAt ? new Date(enrolledAt) : null;
    }
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: params.enrollmentId },
      data: updateData,
      include: {
        course: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrollment dates updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating enrollment:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update enrollment' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
