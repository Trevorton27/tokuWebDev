'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ConversationUser } from './useConversations';

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  createdAt: string;
  updatedAt: string;
  sender: ConversationUser;
}

export function useMessages(conversationId: string | null, pollInterval = 10000) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const latestFetchRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const fetchId = ++latestFetchRef.current;

    try {
      const res = await axios.get(`/api/messages/conversations/${conversationId}`);
      if (fetchId !== latestFetchRef.current) return; // stale
      if (res.data.success) {
        setMessages(res.data.data.messages);
        setHasMore(res.data.data.hasMore);
        setNextCursor(res.data.data.nextCursor);
        setError(null);
      }
    } catch (err) {
      if (fetchId === latestFetchRef.current) {
        setError('Failed to load messages');
      }
    } finally {
      if (fetchId === latestFetchRef.current) {
        setLoading(false);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    setMessages([]);
    setLoading(true);
    setError(null);
    fetchMessages();
    const interval = setInterval(fetchMessages, pollInterval);
    return () => clearInterval(interval);
  }, [fetchMessages, pollInterval]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;
    const res = await axios.post(`/api/messages/conversations/${conversationId}`, { content });
    if (res.data.success) {
      // Prepend new message (messages are in desc order)
      setMessages((prev) => [res.data.data, ...prev]);
      return res.data.data;
    }
    throw new Error(res.data.error);
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || !nextCursor) return;
    try {
      const res = await axios.get(`/api/messages/conversations/${conversationId}?cursor=${nextCursor}`);
      if (res.data.success) {
        setMessages((prev) => [...prev, ...res.data.data.messages]);
        setHasMore(res.data.data.hasMore);
        setNextCursor(res.data.data.nextCursor);
      }
    } catch {
      // Silently fail on load more
    }
  }, [conversationId, nextCursor]);

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await axios.patch(`/api/messages/conversations/${conversationId}/read`);
    } catch {
      // non-critical
    }
  }, [conversationId]);

  return { messages, loading, error, hasMore, sendMessage, loadMore, markRead, refetch: fetchMessages };
}
