import { NextRequest, NextResponse } from 'next/server';
import {
  sendStudentAssessmentEmail,
  type StudentEmailPayload,
} from '@/server/assessment/emailService';
import { logger } from '@/lib/logger';

/**
 * POST /api/assessment/complete
 *
 * Sends a structured assessment results email to the student (CC: support).
 * Accepts either manually-constructed payloads (testing/integrations) or
 * data derived from the live session on completion.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, email, score, level, summary, strengths, weaknesses, recommendations } =
      body as StudentEmailPayload;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required field: name' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Missing or invalid field: email' }, { status: 400 });
    }

    await sendStudentAssessmentEmail({
      name: name.trim(),
      email: email.trim(),
      score: typeof score === 'number' ? Math.round(score) : undefined,
      level,
      summary,
      strengths: Array.isArray(strengths) ? strengths : undefined,
      weaknesses: Array.isArray(weaknesses) ? weaknesses : undefined,
      recommendations: Array.isArray(recommendations) ? recommendations : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('POST /api/assessment/complete failed', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
