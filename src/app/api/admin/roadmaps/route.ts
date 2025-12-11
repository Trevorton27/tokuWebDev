import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/roadmaps - List student roadmaps
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const itemType = searchParams.get('itemType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (itemType) where.itemType = itemType;

    const [roadmaps, total] = await Promise.all([
      prisma.studentRoadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ userId: 'asc' }, { order: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.studentRoadmap.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        roadmaps,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roadmaps' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/roadmaps - Create roadmap item
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { userId, title, description, itemType, status, order, targetDate, metadata } = body;

    if (!userId || !title || !itemType || order === undefined) {
      return NextResponse.json(
        { success: false, error: 'userId, title, itemType, and order are required' },
        { status: 400 }
      );
    }

    const roadmap = await prisma.studentRoadmap.create({
      data: {
        userId,
        title,
        description,
        itemType,
        status: status || 'NOT_STARTED',
        order,
        targetDate: targetDate ? new Date(targetDate) : null,
        metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: roadmap,
      message: 'Roadmap item created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating roadmap:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create roadmap item' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
