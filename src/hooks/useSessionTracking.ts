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
        const response = await axios.post('/api/auth/session-start', {
          sessionToken: sessionId,
        });
        sessionStartedRef.current = true;

        if (response.data.action === 'created') {
          console.log('✅ New session created:', response.data.sessionId);
        } else {
          console.log('🔄 Existing session resumed:', response.data.sessionId);
        }
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

    // Note: Sessions are now kept active across page refreshes/navigation
    // They will be automatically ended by:
    // 1. Stale session cleanup job (24+ hours inactive) - see /api/cron/cleanup-sessions
    // 2. Future: Explicit logout button integration

    // Handle page/tab close and navigation
    const handleBeforeUnload = () => {
      // Only end session if it's a true tab/window close (not a refresh)
      // Note: There's no perfect way to detect this, so we'll be conservative
      // and only update activity, not end the session
      // The stale session cleanup will handle truly abandoned sessions

      if (sessionStartedRef.current) {
        // Update last activity instead of ending session
        // This handles refresh gracefully
        navigator.sendBeacon(
          '/api/auth/session-start',
          new Blob([JSON.stringify({ sessionToken: sessionId })], {
            type: 'application/json',
          })
        );
      }

      // Don't end session here - let stale cleanup handle it
      // OR user will explicitly logout via Clerk
    };

    // Handle visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched tabs or minimized - update last activity
        if (sessionStartedRef.current) {
          navigator.sendBeacon(
            '/api/auth/session-start',
            new Blob([JSON.stringify({ sessionToken: sessionId })], {
              type: 'application/json',
            })
          );
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: end session on unmount
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }

      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Don't end session on unmount - this happens on every navigation
      // Sessions will be ended by:
      // 1. Explicit logout (when user clicks Sign Out)
      // 2. Stale session cleanup (24+ hours inactive)
      // 3. User closing all tabs (detected by pagehide with delay)
    };
  }, [isSignedIn, sessionId]);
}
