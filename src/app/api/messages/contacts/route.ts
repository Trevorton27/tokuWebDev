import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getContactableUsers } from '@/server/messaging/messagingService';

export async function GET() {
  try {
    const user = await requireAuth();
    const contacts = await getContactableUsers(user.id, user.role as any);

    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    logger.error('GET /api/messages/contacts failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contacts' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
