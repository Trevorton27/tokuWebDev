import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  listConversations,
  getOrCreateConversation,
  canUserContact,
} from '@/server/messaging/messagingService';

export async function GET() {
  try {
    const user = await requireAuth();
    const conversations = await listConversations(user.id);

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    logger.error('GET /api/messages/conversations failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'targetUserId is required' },
        { status: 400 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot start a conversation with yourself' },
        { status: 400 }
      );
    }

    // Verify authorization
    const allowed = await canUserContact(user.id, user.role as any, targetUserId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to message this user' },
        { status: 403 }
      );
    }

    const conversation = await getOrCreateConversation(user.id, targetUserId);

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    logger.error('POST /api/messages/conversations failed', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
