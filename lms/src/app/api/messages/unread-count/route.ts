import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getUnreadCount } from '@/server/messaging/messagingService';

export async function GET() {
  try {
    const user = await requireAuth();
    const count = await getUnreadCount(user.id);

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    logger.error('GET /api/messages/unread-count failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get unread count' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
