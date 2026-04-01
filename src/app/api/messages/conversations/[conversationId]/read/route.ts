import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { markAsRead } from '@/server/messaging/messagingService';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { conversationId } = await params;

    const count = await markAsRead(conversationId, user.id);

    return NextResponse.json({ success: true, data: { markedRead: count } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as read';
    const status = message === 'Unauthorized' ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    logger.error('PATCH /api/messages/conversations/[id]/read failed', error);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
