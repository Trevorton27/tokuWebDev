import { NextRequest, NextResponse } from 'next/server';
import { getTutorReply } from '@/server/assessment/aiService';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { challengeId, messages, userCode } = body;

    if (!challengeId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID and messages are required' },
        { status: 400 }
      );
    }

    const response = await getTutorReply(user.id, challengeId, messages, userCode);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    logger.error('POST /api/assessment/chat failed', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get tutor response' },
      { status: 500 }
    );
  }
}
