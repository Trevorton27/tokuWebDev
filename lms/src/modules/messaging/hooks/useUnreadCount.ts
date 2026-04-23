'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useUnreadCount(pollInterval = 30000) {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/unread-count');
      if (res.data.success) {
        setCount(res.data.data.count);
      }
    } catch {
      // Silently fail - badge is non-critical
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, pollInterval);
    return () => clearInterval(interval);
  }, [fetchCount, pollInterval]);

  return { count, refetch: fetchCount };
}
