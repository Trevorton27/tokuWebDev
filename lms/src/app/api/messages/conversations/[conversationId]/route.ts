import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getMessages, sendMessage } from '@/server/messaging/messagingService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const result = await getMessages(conversationId, user.id, cursor, limit);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    const status = message === 'Unauthorized' ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    logger.error('GET /api/messages/conversations/[id] failed', error);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { conversationId } = await params;
    const body = await request.json();
    const { content, attachment } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const msg = await sendMessage(conversationId, user.id, content.trim(), attachment);

    return NextResponse.json({ success: true, data: msg });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    const status = message === 'Unauthorized' ? 401 : message.startsWith('Forbidden') ? 403 : 500;
    logger.error('POST /api/messages/conversations/[id] failed', error);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
