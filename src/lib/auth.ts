/**
 * Authentication Library
 *
 * This file provides authentication utilities for the LMS application.
 * It integrates with Clerk for user authentication and syncs user data with our database.
 *
 * Key Features:
 * - User authentication via Clerk
 * - Database synchronization (Clerk ID -> Database ID mapping)
 * - Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
 * - Protected route helpers
 *
 * @module lib/auth
 */

import { currentUser, auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/server/auth/userSyncService';

/**
 * Current User Interface
 *
 * Represents the authenticated user with database information.
 * Note: The 'id' field is the DATABASE user ID, not the Clerk ID.
 *
 * @interface CurrentUser
 * @property {string} id - Database user ID (from User table)
 * @property {string} email - User's email address
 * @property {string | null} name - User's full name (may be null)
 * @property {'STUDENT' | 'INSTRUCTOR' | 'ADMIN'} role - User's role for authorization
 */
export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

/**
 * Get Currently Authenticated User
 *
 * Retrieves the current user from Clerk and syncs with database.
 * This function is the primary way to get user information in API routes and server components.
 *
 * Flow:
 * 1. Fetch user from Clerk session
 * 2. Extract user information (email, name, role from metadata)
 * 3. Sync with database (creates user record if it doesn't exist)
 * 4. Return database user information
 *
 * IMPORTANT: The returned 'id' is the DATABASE user ID, not Clerk ID.
 * This ensures consistency across the app when referencing users.
 *
 * @async
 * @returns {Promise<CurrentUser | null>} User object if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (!user) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * console.log(user.role); // 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
 * ```
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Fetch the authenticated user from Clerk
  const clerkUser = await currentUser();

  // Not authenticated - return null
  if (!clerkUser) {
    return null;
  }

  // Extract role from Clerk's public metadata
  // Roles are managed in Clerk Dashboard under user metadata
  // Default to STUDENT if no role is explicitly set
  const role = (clerkUser.publicMetadata?.role as 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') || 'STUDENT';

  // Extract email from the first email address
  // Clerk supports multiple email addresses, but we use the primary one
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';

  // Construct full name from first and last name
  // Falls back to either first or last name alone, or null if neither exists
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.firstName || clerkUser.lastName || null;

  // Sync user data with database
  // This creates a new user record if it doesn't exist, or updates existing one
  // The database record links Clerk ID to our internal user ID
  const dbUser = await getOrCreateUser({
    clerkId: clerkUser.id,
    email,
    name,
    role,
    avatarUrl: clerkUser.imageUrl,
  });

  // Prepare user data to return
  // CRITICAL: We return the DATABASE ID (dbUser.id), not the Clerk ID
  // This ensures all database queries use the correct ID
  const currentUserData = {
    id: dbUser.id, // Database user ID (e.g., 'cm1abc123xyz')
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  };

  // Development logging for debugging authentication issues
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Current User:', {
      email: currentUserData.email,
      role: currentUserData.role,
      dbId: currentUserData.id, // Database ID
      clerkId: clerkUser.id // Clerk ID (e.g., 'user_abc123')
    });
  }

  return currentUserData;
}

/**
 * Require Authentication
 *
 * Guards a route by requiring the user to be authenticated.
 * Throws an error if the user is not logged in.
 *
 * This is useful for API routes that must have an authenticated user.
 * The error will be caught by the API route's try-catch block.
 *
 * @async
 * @throws {Error} If user is not authenticated
 * @returns {Promise<CurrentUser>} The authenticated user
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   try {
 *     const user = await requireAuth();
 *     // User is guaranteed to be authenticated here
 *     return NextResponse.json({ user });
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 * ```
 */
export async function requireAuth(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require Specific Role(s)
 *
 * Guards a route by requiring the user to have one of the specified roles.
 * First checks authentication, then validates role permissions.
 *
 * This is the primary way to implement role-based access control (RBAC).
 * Commonly used in admin and instructor-only API routes.
 *
 * @async
 * @param {CurrentUser['role'][]} allowedRoles - Array of roles that are allowed to access this route
 * @throws {Error} If user is not authenticated or doesn't have required role
 * @returns {Promise<CurrentUser>} The authenticated user with valid role
 *
 * @example
 * ```typescript
 * // Admin-only route
 * export async function DELETE(request: NextRequest) {
 *   try {
 *     const user = await requireRole(['ADMIN']);
 *     // Only admins can reach this code
 *   } catch (error) {
 *     return NextResponse.json({ error: error.message }, { status: 403 });
 *   }
 * }
 *
 * // Admin or Instructor route
 * export async function POST(request: NextRequest) {
 *   const user = await requireRole(['ADMIN', 'INSTRUCTOR']);
 *   // Both admins and instructors can access this
 * }
 * ```
 */
export async function requireRole(allowedRoles: CurrentUser['role'][]): Promise<CurrentUser> {
  // First ensure user is authenticated
  const user = await requireAuth();

  // Check if user's role is in the allowed roles list
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Get User From Request
 *
 * Convenience wrapper around getCurrentUser for API routes.
 * This function exists for backward compatibility and semantic clarity.
 *
 * @async
 * @param {NextRequest} req - The Next.js request object (not currently used, but provided for future extensibility)
 * @returns {Promise<CurrentUser | null>} User object if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await getUserFromRequest(request);
 *   if (!user) {
 *     return NextResponse.json({ error: 'Please log in' }, { status: 401 });
 *   }
 *   // User is authenticated
 * }
 * ```
 */
export async function getUserFromRequest(req: NextRequest): Promise<CurrentUser | null> {
  return getCurrentUser();
}

/**
 * Clerk Auth Object Export
 *
 * Re-exports the auth() function from Clerk for use in middleware.
 * This is used in middleware.ts to protect routes at the edge.
 *
 * @see https://clerk.com/docs/references/nextjs/auth
 */
export { auth };
