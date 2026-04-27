import { NextRequest, NextResponse } from 'next/server';
import { sendAssessmentEmails, type AssessmentEmailPayload } from '@/server/assessment/emailService';
import { logger } from '@/lib/logger';

/**
 * POST /api/assessment/complete
 *
 * Sends:
 * 1. Full internal report to support@signalworksdesign.com
 * 2. Confirmation email to the student
 *
 * Required: name, email, answers
 */
export async function POST(req: NextRequest) {
  try {
    let body: AssessmentEmailPayload;
    try {
      const raw = await req.text();
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    const { name, email, answers } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required field: name' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Missing or invalid field: email' }, { status: 400 });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required field: answers (must be a non-empty array)' }, { status: 400 });
    }

    const error = await sendAssessmentEmails(body);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('POST /api/assessment/complete failed', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
