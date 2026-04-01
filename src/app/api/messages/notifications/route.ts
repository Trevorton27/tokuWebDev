import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
} from '@/server/messaging/messagingService';

export async function GET() {
  try {
    const user = await requireAuth();
    const [notifications, unreadCount] = await Promise.all([
      getNotifications(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    logger.error('GET /api/messages/notifications failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { notificationIds } = body as { notificationIds?: string[] };

    const result = await markNotificationsRead(user.id, notificationIds);

    return NextResponse.json({ success: true, data: { markedRead: result.count } });
  } catch (error) {
    logger.error('PATCH /api/messages/notifications failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to mark notifications' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
