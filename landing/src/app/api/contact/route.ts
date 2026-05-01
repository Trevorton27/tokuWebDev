import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createAndSendInvite } from '@/lib/consultation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'Signal Works <contact@email.signalworksdesign.com>',
    to: 'trevor-sensei@signalworksdesign.com',
    replyTo: email,
    subject: `New inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Fire-and-forget: send consultation booking invite to the lead
  createAndSendInvite(name, email, 'landing').catch((err) => {
    console.error('[consultation] invite failed for', email, '—', err?.message ?? err);
    console.error('[consultation] DATABASE_URL set?', !!process.env.DATABASE_URL);
    console.error('[consultation] RESEND_API_KEY set?', !!process.env.RESEND_API_KEY);
  });

  return NextResponse.json({ success: true });
}
