/**
 * GitHub Event Service
 * Process GitHub webhook events and track repository activity
 */

import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { GitHubEvent } from '@prisma/client';

interface GitHubPushPayload {
  ref: string;
  before: string;
  after: string;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
    added: string[];
    removed: string[];
    modified: string[];
  }>;
}

interface GitHubPullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    title: string;
    state: string;
    html_url: string;
    additions: number;
    deletions: number;
    changed_files: number;
  };
  repository: {
    name: string;
    full_name: string;
  };
  sender: {
    login: string;
  };
}

/**
 * Process GitHub webhook event
 * @param eventType - GitHub event type (push, pull_request, etc.)
 * @param action - Event action (opened, closed, etc.)
 * @param payload - Complete webhook payload
 */
export async function processGitHubWebhook(
  eventType: string,
  action: string | undefined,
  payload: any
): Promise<void> {
  try {
    logger.info('Processing GitHub webhook', { eventType, action });

    // Find user by GitHub username from repository owner or pusher
    let githubUsername: string | undefined;

    if (eventType === 'push') {
      githubUsername = (payload as GitHubPushPayload).pusher?.name;
    } else if (eventType === 'pull_request') {
      githubUsername = (payload as GitHubPullRequestPayload).sender?.login;
    }

    if (!githubUsername) {
      logger.warn('Could not extract GitHub username from webhook', {
        eventType,
        payload: JSON.stringify(payload).substring(0, 200),
      });
      return;
    }

    // Find LMS user by GitHub username
    const user = await prisma.user.findFirst({
      where: {
        githubUsername: {
          equals: githubUsername,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      logger.warn('No LMS user found for GitHub username', { githubUsername });
      return;
    }

    // Process event based on type
    switch (eventType) {
      case 'push':
        await processPushEvent(user.id, payload as GitHubPushPayload);
        break;
      case 'pull_request':
        await processPullRequestEvent(
          user.id,
          action!,
          payload as GitHubPullRequestPayload
        );
        break;
      default:
        logger.info('Unhandled GitHub event type', { eventType });
    }

    // Update user's lastActiveAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    logger.error('Failed to process GitHub webhook', error, { eventType });
    throw error;
  }
}

/**
 * Process push event
 */
async function processPushEvent(
  userId: string,
  payload: GitHubPushPayload
): Promise<void> {
  try {
    const commitCount = payload.commits?.length || 0;
    const branch = payload.ref.replace('refs/heads/', '');

    // Calculate total additions and deletions
    let additions = 0;
    let deletions = 0;

    // Note: Detailed line counts not available in push payload
    // They're only in pull_request events

    await prisma.gitHubEvent.create({
      data: {
        userId,
        eventType: 'push',
        action: null,
        repository: payload.repository.full_name,
        repoUrl: payload.repository.html_url,
        payload: payload as any,
        commitCount,
        additions,
        deletions,
        branch,
      },
    });

    logger.info('Push event processed', {
      userId,
      repository: payload.repository.full_name,
      commits: commitCount,
      branch,
    });
  } catch (error) {
    logger.error('Failed to process push event', error);
    throw error;
  }
}

/**
 * Process pull request event
 */
async function processPullRequestEvent(
  userId: string,
  action: string,
  payload: GitHubPullRequestPayload
): Promise<void> {
  try {
    await prisma.gitHubEvent.create({
      data: {
        userId,
        eventType: 'pull_request',
        action,
        repository: payload.repository.full_name,
        repoUrl: payload.pull_request.html_url,
        payload: payload as any,
        commitCount: null,
        additions: payload.pull_request.additions,
        deletions: payload.pull_request.deletions,
        branch: null,
      },
    });

    logger.info('Pull request event processed', {
      userId,
      repository: payload.repository.full_name,
      action,
      number: payload.number,
    });
  } catch (error) {
    logger.error('Failed to process pull request event', error);
    throw error;
  }
}

/**
 * Link GitHub account to LMS user
 * @param userId - User ID
 * @param githubUsername - GitHub username
 * @param repoUrl - Optional repository URL
 */
export async function linkGitHubUser(
  userId: string,
  githubUsername: string,
  repoUrl?: string
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        githubUsername,
        githubRepoUrl: repoUrl || null,
      },
    });

    logger.info('GitHub account linked', { userId, githubUsername });
  } catch (error) {
    logger.error('Failed to link GitHub account', error, { userId });
    throw new Error('Failed to link GitHub account');
  }
}

/**
 * Get GitHub activity for a user
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of GitHub events
 */
export async function getGitHubActivity(
  userId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: string[];
    limit?: number;
  }
): Promise<GitHubEvent[]> {
  try {
    const events = await prisma.gitHubEvent.findMany({
      where: {
        userId,
        ...(options?.startDate && {
          timestamp: {
            gte: options.startDate,
            ...(options?.endDate && { lte: options.endDate }),
          },
        }),
        ...(options?.eventTypes && {
          eventType: { in: options.eventTypes },
        }),
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: options?.limit || 50,
    });

    return events;
  } catch (error) {
    logger.error('Failed to get GitHub activity', error, { userId });
    throw new Error('Failed to retrieve GitHub activity');
  }
}

/**
 * Get GitHub activity statistics for a user
 * @param userId - User ID
 * @param days - Number of days to look back
 * @returns Activity statistics
 */
export async function getGitHubStatistics(
  userId: string,
  days: number = 7
): Promise<{
  totalCommits: number;
  totalPRs: number;
  totalAdditions: number;
  totalDeletions: number;
  repositories: string[];
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await prisma.gitHubEvent.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
    });

    const totalCommits = events
      .filter((e) => e.eventType === 'push')
      .reduce((sum, e) => sum + (e.commitCount || 0), 0);

    const totalPRs = events.filter((e) => e.eventType === 'pull_request').length;

    const totalAdditions = events.reduce(
      (sum, e) => sum + (e.additions || 0),
      0
    );

    const totalDeletions = events.reduce(
      (sum, e) => sum + (e.deletions || 0),
      0
    );

    const repositories = [...new Set(events.map((e) => e.repository))];

    return {
      totalCommits,
      totalPRs,
      totalAdditions,
      totalDeletions,
      repositories,
    };
  } catch (error) {
    logger.error('Failed to get GitHub statistics', error, { userId });
    throw new Error('Failed to calculate GitHub statistics');
  }
}
