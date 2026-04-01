'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface ConversationUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface ConversationPreview {
  id: string;
  otherUser: ConversationUser;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    readAt: string | null;
  } | null;
  unreadCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export function useConversations(pollInterval = 15000) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, pollInterval);
    return () => clearInterval(interval);
  }, [fetchConversations, pollInterval]);

  const createConversation = useCallback(async (targetUserId: string) => {
    const res = await axios.post('/api/messages/conversations', { targetUserId });
    if (res.data.success) {
      await fetchConversations();
      return res.data.data;
    }
    throw new Error(res.data.error);
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations, createConversation };
}
