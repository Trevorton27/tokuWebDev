import { NextRequest, NextResponse } from 'next/server';
import { runCodeWithJDoodle } from '@/server/assessment/runCodeService';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, input } = body;

    if (!code || !language) {
      return NextResponse.json(
        { success: false, error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const result = await runCodeWithJDoodle(code, language, input || '');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('POST /api/assessment/run-code failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
