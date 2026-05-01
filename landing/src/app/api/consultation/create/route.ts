import { NextRequest, NextResponse } from 'next/server';
import { createAndSendInvite } from '@/lib/consultation';

export async function POST(req: NextRequest) {
  const { name, email, source } = await req.json();

  if (!email || !source) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['landing', 'assessment'].includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  try {
    await createAndSendInvite(name, email, source);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/consultation/create failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
