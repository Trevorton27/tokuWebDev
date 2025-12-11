import { NextRequest, NextResponse } from 'next/server';
import { getChallengeBySlug } from '@/server/assessment/challengeService';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const challenge = await getChallengeBySlug(params.slug);

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    logger.error('GET /api/assessment/challenges/[slug] failed', error, { slug: params.slug });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
