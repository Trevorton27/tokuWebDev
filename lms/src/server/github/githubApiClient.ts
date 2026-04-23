/**
 * GitHub API Client
 * Fetches user repositories and activity data from GitHub REST API
 */

import { logger } from '@/lib/logger';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Custom error for GitHub API rate limiting
 */
export class GitHubRateLimitError extends Error {
  constructor(
    message: string,
    public resetAt?: Date
  ) {
    super(message);
    this.name = 'GitHubRateLimitError';
  }
}

/**
 * Custom error for GitHub API authentication issues
 */
export class GitHubAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthError';
  }
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 (GitHub's contribution level)
}

/**
 * Handle GitHub API response and check for errors
 */
async function handleGitHubResponse(response: Response): Promise<void> {
  if (!response.ok) {
    // Check for rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');

      if (rateLimitRemaining === '0') {
        const resetDate = rateLimitReset
          ? new Date(parseInt(rateLimitReset) * 1000)
          : undefined;

        throw new GitHubRateLimitError(
          'GitHub API rate limit exceeded. Please add your GitHub Personal Access Token in the Webhook tab to increase rate limits from 60 to 5,000 requests/hour.',
          resetDate
        );
      }

      throw new GitHubAuthError('GitHub API authentication failed. Please check your credentials.');
    }

    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
}

/**
 * Fetch user repositories from GitHub
 * @param username - GitHub username
 * @param options - Fetch options
 * @param userToken - Optional user-specific GitHub PAT (takes precedence over env var)
 * @returns Array of repositories
 */
export async function fetchUserRepositories(
  username: string,
  options?: {
    type?: 'all' | 'owner' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    perPage?: number;
  },
  userToken?: string
): Promise<GitHubRepository[]> {
  try {
    const params = new URLSearchParams({
      type: options?.type || 'owner',
      sort: options?.sort || 'updated',
      per_page: String(options?.perPage || 100),
    });

    // Use user token if provided, otherwise fall back to env var
    const token = userToken || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?${params}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      }
    );

    await handleGitHubResponse(response);

    const repos: GitHubRepository[] = await response.json();
    return repos;
  } catch (error) {
    logger.error('Failed to fetch GitHub repositories', error, { username });
    throw error;
  }
}

/**
 * Fetch user's recent activity events from GitHub
 * @param username - GitHub username
 * @param perPage - Number of events to fetch (default 30, max 100)
 * @param userToken - Optional user-specific GitHub PAT (takes precedence over env var)
 * @returns Array of GitHub events
 */
export async function fetchUserEvents(
  username: string,
  perPage: number = 30,
  userToken?: string
): Promise<GitHubEvent[]> {
  try {
    // Use user token if provided, otherwise fall back to env var
    const token = userToken || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/events?per_page=${perPage}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      }
    );

    await handleGitHubResponse(response);

    const events: GitHubEvent[] = await response.json();
    return events;
  } catch (error) {
    logger.error('Failed to fetch GitHub events', error, { username });
    throw error;
  }
}

/**
 * Parse contribution data from user events
 * Aggregates commits, PRs, and other activities by date
 * @param username - GitHub username
 * @param days - Number of days to look back (default 30)
 * @param userToken - Optional user-specific GitHub PAT (takes precedence over env var)
 * @returns Array of contribution days
 */
export async function fetchContributionData(
  username: string,
  days: number = 30,
  userToken?: string
): Promise<ContributionDay[]> {
  try {
    // Fetch recent events (GitHub only provides last 90 days via API)
    const events = await fetchUserEvents(username, 100, userToken);

    // Create a map of date -> contribution count
    const contributionMap = new Map<string, number>();

    // Initialize all dates in range with 0 contributions
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      contributionMap.set(dateStr, 0);
    }

    // Count contributions from events
    events.forEach((event) => {
      const eventDate = new Date(event.created_at).toISOString().split('T')[0];

      if (contributionMap.has(eventDate)) {
        const currentCount = contributionMap.get(eventDate) || 0;

        // Weight different event types
        let weight = 1;
        switch (event.type) {
          case 'PushEvent':
            // Count commits
            weight = event.payload?.commits?.length || 1;
            break;
          case 'PullRequestEvent':
            weight = 2;
            break;
          case 'IssuesEvent':
            weight = 1;
            break;
          case 'CreateEvent':
            weight = 1;
            break;
          case 'PullRequestReviewEvent':
            weight = 1;
            break;
          default:
            weight = 0.5;
        }

        contributionMap.set(eventDate, currentCount + weight);
      }
    });

    // Convert to array and calculate levels
    const contributions: ContributionDay[] = [];
    contributionMap.forEach((count, date) => {
      // Calculate level (0-4) based on contribution count
      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      contributions.push({
        date,
        count: Math.round(count),
        level,
      });
    });

    // Sort by date (oldest first)
    contributions.sort((a, b) => a.date.localeCompare(b.date));

    return contributions;
  } catch (error) {
    logger.error('Failed to fetch contribution data', error, { username });
    throw error;
  }
}

/**
 * Get aggregated statistics for a user
 * @param username - GitHub username
 * @param userToken - Optional user-specific GitHub PAT (takes precedence over env var)
 * @returns Statistics object
 */
export async function fetchUserStatistics(
  username: string,
  userToken?: string
): Promise<{
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: { [key: string]: number };
  recentActivity: number;
}> {
  try {
    const [repos, events] = await Promise.all([
      fetchUserRepositories(username, undefined, userToken),
      fetchUserEvents(username, 100, userToken),
    ]);

    const stats = {
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      languages: {} as { [key: string]: number },
      recentActivity: events.length,
    };

    // Count languages
    repos.forEach((repo) => {
      if (repo.language) {
        stats.languages[repo.language] =
          (stats.languages[repo.language] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    logger.error('Failed to fetch user statistics', error, { username });
    throw error;
  }
}

/**
 * Verify if a GitHub username exists
 * @param username - GitHub username to verify
 * @returns True if user exists
 */
export async function verifyGitHubUser(username: string): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}
