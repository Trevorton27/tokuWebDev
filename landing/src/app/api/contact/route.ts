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

  // Await the invite so it completes before the function terminates on Vercel
  try {
    await createAndSendInvite(name, email, 'landing');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[consultation] invite failed for', email, '—', msg);
  }

  return NextResponse.json({ success: true });
}
