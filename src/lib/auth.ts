import { currentUser, auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/server/auth/userSyncService';

/**
 * Auth helpers for getting current user and protecting routes
 * Using Clerk for authentication
 */

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

/**
 * Get the currently authenticated user from Clerk
 * Returns null if not authenticated
 * Syncs user with database and returns database user ID
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Get role from Clerk's public metadata
  // Default to STUDENT if no role is set
  const role = (clerkUser.publicMetadata?.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') || 'STUDENT';

  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.firstName || clerkUser.lastName || null;

  // Sync with database - get or create user record
  const dbUser = await getOrCreateUser({
    clerkId: clerkUser.id,
    email,
    name,
    role,
    avatarUrl: clerkUser.imageUrl,
  });

  const currentUserData = {
    id: dbUser.id, // Return database user ID, not Clerk ID
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  };

  // Log user info in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Current User:', {
      email: currentUserData.email,
      role: currentUserData.role,
      dbId: currentUserData.id,
      clerkId: clerkUser.id
    });
  }

  return currentUserData;
}

/**
 * Require authentication, throw error if not authenticated
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: CurrentUser['role'][]): Promise<CurrentUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Get user from request (for API routes)
 * This is a convenience wrapper around getCurrentUser for API routes
 */
export async function getUserFromRequest(req: NextRequest): Promise<CurrentUser | null> {
  return getCurrentUser();
}

/**
 * Get auth object from Clerk (for use in middleware)
 */
export { auth };
