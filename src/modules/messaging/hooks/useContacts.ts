'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ConversationUser } from './useConversations';

export function useContacts() {
  const [contacts, setContacts] = useState<ConversationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/contacts');
      if (res.data.success) {
        setContacts(res.data.data);
        setError(null);
      }
    } catch {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, loading, error, refetch: fetchContacts };
}
