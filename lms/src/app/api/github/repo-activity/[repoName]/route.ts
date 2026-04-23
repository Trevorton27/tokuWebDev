/**
 * Repository-Specific Activity API
 * Fetch detailed activity and stats for a specific repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

const GITHUB_API_BASE = 'https://api.github.com';

interface RouteParams {
  params: {
    repoName: string;
  };
}

/**
 * GET - Fetch repository-specific activity and statistics
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await requireAuth();
    const repoName = decodeURIComponent(params.repoName);

    // Verify this repo is connected to the user
    const connectedRepo = await prisma.connectedRepository.findFirst({
      where: {
        userId: user.id,
        repoName,
        isActive: true,
      },
    });

    if (!connectedRepo) {
      return NextResponse.json(
        { success: false, error: 'Repository not connected to your account' },
        { status: 403 }
      );
    }

    // Fetch repository details, commits, and events from GitHub
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_PERSONAL_ACCESS_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      }),
    };

    // Fetch in parallel for performance
    const [repoResponse, commitsResponse, eventsResponse] = await Promise.all([
      // Repository details
      fetch(`${GITHUB_API_BASE}/repos/${repoName}`, { headers }),
      // Recent commits (last 30)
      fetch(`${GITHUB_API_BASE}/repos/${repoName}/commits?per_page=30`, {
        headers,
      }),
      // Recent events
      fetch(`${GITHUB_API_BASE}/repos/${repoName}/events?per_page=30`, {
        headers,
      }),
    ]);

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();
    const commits = commitsResponse.ok ? await commitsResponse.json() : [];
    const events = eventsResponse.ok ? await eventsResponse.json() : [];

    // Process commits
    const processedCommits = commits.slice(0, 10).map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0], // First line only
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url,
    }));

    // Process events
    const processedEvents = events.slice(0, 10).map((event: any) => ({
      id: event.id,
      type: event.type,
      createdAt: event.created_at,
      actor: event.actor.login,
      payload: {
        action: event.payload.action,
        ref: event.payload.ref,
        size: event.payload.size,
      },
    }));

    // Calculate activity stats
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentCommits = commits.filter((commit: any) => {
      return new Date(commit.commit.author.date) > last30Days;
    });

    const recentEvents = events.filter((event: any) => {
      return new Date(event.created_at) > last30Days;
    });

    return NextResponse.json({
      success: true,
      data: {
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          url: repoData.html_url,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          openIssues: repoData.open_issues_count,
          createdAt: repoData.created_at,
          updatedAt: repoData.updated_at,
          pushedAt: repoData.pushed_at,
          size: repoData.size,
          defaultBranch: repoData.default_branch,
          private: repoData.private,
        },
        recentCommits: processedCommits,
        recentEvents: processedEvents,
        stats: {
          totalCommits: commits.length >= 30 ? '30+' : commits.length,
          commitsLast30Days: recentCommits.length,
          eventsLast30Days: recentEvents.length,
          lastPushed: repoData.pushed_at,
        },
      },
    });
  } catch (error) {
    logger.error('GET /api/github/repo-activity failed', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { success: false, error: 'Repository not found on GitHub' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch repository activity' },
      { status: 500 }
    );
  }
}
