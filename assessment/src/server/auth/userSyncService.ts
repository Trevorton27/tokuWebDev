/**
 * User sync service - Syncs Clerk users with database
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Role } from '@prisma/client';

interface ClerkUserData {
  clerkId: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl?: string;
}

/**
 * Get or create a user from Clerk data
 * This ensures that Clerk users always have a corresponding record in the database
 */
export async function getOrCreateUser(userData: ClerkUserData) {
  try {
    // First, try to find user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: userData.clerkId },
    });

    if (user) {
      // User exists - update their info in case it changed in Clerk
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatarUrl: userData.avatarUrl,
        },
      });

      logger.info('User synced from Clerk', { userId: user.id, clerkId: userData.clerkId });
      return user;
    }

    // User doesn't exist - check if there's an existing user with this email (legacy user)
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingEmailUser) {
      // This is a legacy user - update them with the clerkId
      user = await prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          clerkId: userData.clerkId,
          name: userData.name || existingEmailUser.name,
          role: userData.role,
          avatarUrl: userData.avatarUrl || existingEmailUser.avatarUrl,
        },
      });

      logger.info('Legacy user migrated to Clerk', { userId: user.id, clerkId: userData.clerkId });
      return user;
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        clerkId: userData.clerkId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        password: null, // Clerk users don't need passwords
      },
    });

    logger.info('New user created from Clerk', { userId: user.id, clerkId: userData.clerkId });
    return user;
  } catch (error) {
    logger.error('Failed to get or create user', error, {
      clerkId: userData.clerkId,
      email: userData.email,
      role: userData.role,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    // Re-throw the original error for better debugging
    throw error;
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    return user;
  } catch (error) {
    logger.error('Failed to get user by clerkId', error, { clerkId });
    throw new Error('Failed to retrieve user');
  }
}
