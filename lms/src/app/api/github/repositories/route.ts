/**
 * GitHub Repositories API
 * Fetch available repositories from GitHub for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { fetchUserRepositories } from '@/server/github/githubApiClient';

/**
 * GET - Fetch user's GitHub repositories
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get GitHub username from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { githubUsername: true },
    });

    if (!dbUser?.githubUsername) {
      return NextResponse.json(
        {
          success: false,
          error: 'GitHub username not configured. Please set your GitHub username first.',
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') as 'all' | 'owner' | 'member') || 'owner';
    const sort = (searchParams.get('sort') as 'created' | 'updated' | 'pushed' | 'full_name') || 'updated';

    // Fetch repositories from GitHub
    const repositories = await fetchUserRepositories(dbUser.githubUsername, {
      type,
      sort,
      perPage: 100,
    });

    // Filter out forks if specified
    const includeForks = searchParams.get('includeForks') === 'true';
    const filteredRepos = includeForks
      ? repositories
      : repositories.filter((repo) => !repo.fork);

    return NextResponse.json({
      success: true,
      repositories: filteredRepos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        private: repo.private,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
      })),
      total: filteredRepos.length,
    });
  } catch (error) {
    logger.error('GET /api/github/repositories failed', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
