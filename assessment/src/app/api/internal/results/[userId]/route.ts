import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = params;

  try {
    const sessions = await prisma.assessmentSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        responses: true,
      },
    });

    const skillMasteries = await prisma.userSkillMastery.findMany({
      where: { userId },
    });

    return NextResponse.json({ sessions, skillMasteries });
  } catch (error) {
    console.error('Internal results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
