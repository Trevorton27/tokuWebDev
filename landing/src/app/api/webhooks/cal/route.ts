import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import prisma from '@/lib/prisma';

// Cal.com sends HMAC-SHA256 signature in X-Cal-Signature-256 header
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.CAL_COM_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac('sha256', secret).update(body).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-cal-signature-256');

  // Cal.com ping/connectivity tests do not include a signature — acknowledge them
  if (!signature) {
    return NextResponse.json({ received: true });
  }

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const triggerEvent = payload.triggerEvent as string | undefined;
  if (triggerEvent !== 'BOOKING_CREATED') {
    // Acknowledge other events without processing
    return NextResponse.json({ received: true });
  }

  const booking = payload.payload as Record<string, unknown> | undefined;
  const attendees = booking?.attendees as Array<{ email: string; name: string }> | undefined;
  const attendeeEmail = attendees?.[0]?.email;
  const startTime = booking?.startTime as string | undefined;
  const uid = booking?.uid as string | undefined;

  if (!attendeeEmail) {
    return NextResponse.json({ error: 'No attendee email' }, { status: 400 });
  }

  // Find the most recent pending invite for this email
  const invite = await prisma.consultationInvite.findFirst({
    where: { email: attendeeEmail, status: 'sent' },
    orderBy: { createdAt: 'desc' },
  });

  if (invite) {
    await prisma.consultationInvite.update({
      where: { id: invite.id },
      data: {
        status: 'booked',
        calEventId: uid ?? null,
        scheduledAt: startTime ? new Date(startTime) : null,
      },
    });
  }

  return NextResponse.json({ received: true });
}
