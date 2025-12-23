'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

/**
 * Hook to automatically track user login sessions
 * - Starts session on mount
 * - Updates activity every 5 minutes
 * - Ends session on unmount/logout
 */
export function useSessionTracking() {
  const { isSignedIn, sessionId } = useAuth();
  const sessionStartedRef = useRef(false);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    // Start session on mount
    const startSession = async () => {
      if (sessionStartedRef.current) return;

      try {
        await axios.post('/api/auth/session-start', {
          sessionToken: sessionId,
        });
        sessionStartedRef.current = true;
        console.log('Session tracking started');
      } catch (error) {
        console.error('Failed to start session tracking:', error);
      }
    };

    startSession();

    // Update activity every 5 minutes
    activityIntervalRef.current = setInterval(async () => {
      try {
        await axios.post('/api/auth/session-start', {
          sessionToken: sessionId,
        });
        console.log('Session activity updated');
      } catch (error) {
        console.error('Failed to update session activity:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup: end session on unmount
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }

      // End session
      if (sessionStartedRef.current) {
        axios.post('/api/auth/session-end', {
          sessionToken: sessionId,
        }).catch((error) => {
          console.error('Failed to end session:', error);
        });
        sessionStartedRef.current = false;
        console.log('Session tracking ended');
      }
    };
  }, [isSignedIn, sessionId]);
}
