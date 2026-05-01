import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const invite = await prisma.consultationInvite.findUnique({
    where: { token },
    select: { name: true, email: true, status: true, expiresAt: true },
  });

  if (!invite) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 });
  }

  return NextResponse.json({ name: invite.name, email: invite.email, status: invite.status });
}
