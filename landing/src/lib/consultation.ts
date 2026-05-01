import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import prisma from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Signal Works Design <contact@email.signalworksdesign.com>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://signalworksdesign.com';
const TOKEN_TTL_DAYS = 7;

export async function createAndSendInvite(
  name: string | undefined,
  email: string,
  source: 'landing' | 'assessment'
): Promise<void> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.consultationInvite.create({
    data: { email, name: name ?? null, source, token, expiresAt },
  });

  const bookingUrl = `${BASE_URL}/consultation/book?token=${token}`;
  const greeting = name ? `Hi ${name},` : 'Hi there,';

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Schedule Your Free Consultation – Signal Works Design',
    html: buildInviteHtml(greeting, bookingUrl, name),
    text: buildInviteText(greeting, bookingUrl),
  });
}

function buildInviteHtml(greeting: string, bookingUrl: string, name?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Signal Works Design</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;">AI-Powered Software Development</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">${greeting}</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
              Thank you for your interest in Signal Works Design. We'd love to learn more about your goals
              and walk you through exactly how the program works.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.6;">
              Use the link below to book a free <strong>30-minute consultation</strong> at a time that works for you.
              We'll cover your background, what you want to build, and which course is the right fit.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:8px;">
                  <a href="${bookingUrl}"
                     style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">
                    Schedule Your Consultation →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-align:center;">
              This link is valid for 7 days.
            </p>
            <p style="margin:0;font-size:11px;color:#d1d5db;text-align:center;word-break:break-all;">
              ${bookingUrl}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f3f4f6;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Signal Works Design · <a href="mailto:trevor-sensei@signalworksdesign.com" style="color:#6366f1;text-decoration:none;">trevor-sensei@signalworksdesign.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildInviteText(greeting: string, bookingUrl: string): string {
  return [
    greeting,
    '',
    'Thank you for your interest in Signal Works Design.',
    '',
    "We'd love to learn more about your goals and walk you through how the program works.",
    'Book a free 30-minute consultation at a time that suits you:',
    '',
    bookingUrl,
    '',
    'This link is valid for 7 days.',
    '',
    '— The Signal Works Design Team',
    'trevor-sensei@signalworksdesign.com',
  ].join('\n');
}
