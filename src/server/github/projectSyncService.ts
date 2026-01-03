/**
 * GitHub Project Sync Service
 * Polls GitHub API to sync student project data
 */

import { Octokit } from '@octokit/rest';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { StudentProject, ProjectMilestone } from '@prisma/client';

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

export interface SyncResult {
  success: boolean;
  projectId: string;
  updates?: {
    commits?: number;
    prs?: number;
    milestones?: number;
  };
  error?: string;
}

/**
 * Sync a single student project with GitHub data
 */
export async function syncProjectWithGitHub(
  projectId: string
): Promise<SyncResult> {
  try {
    const project = await prisma.studentProject.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    });

    if (!project) {
      return {
        success: false,
        projectId,
        error: 'Project not found',
      };
    }

    // Fetch commits from GitHub
    const commits = await fetchRecentCommits(project.repoOwner, project.repoName);

    // Fetch PRs from GitHub
    const prs = await fetchPullRequests(project.repoOwner, project.repoName);

    // Update project with latest data
    const updateData: any = {
      lastSyncedAt: new Date(),
    };

    if (commits.length > 0) {
      const latestCommit = commits[0];
      updateData.lastCommitSha = latestCommit.sha;
      updateData.lastCommitMsg = latestCommit.commit.message;
      updateData.lastCommitDate = new Date(latestCommit.commit.author?.date || '');
      updateData.totalCommits = commits.length;
    }

    updateData.openPRs = prs.filter((pr) => pr.state === 'open').length;
    updateData.closedPRs = prs.filter((pr) => pr.state === 'closed').length;

    await prisma.studentProject.update({
      where: { id: projectId },
      data: updateData,
    });

    // Check milestone completion
    const milestonesUpdated = await checkMilestoneCompletion(
      project,
      commits
    );

    logger.info('Project synced successfully', {
      projectId,
      commits: commits.length,
      prs: prs.length,
      milestonesUpdated,
    });

    return {
      success: true,
      projectId,
      updates: {
        commits: commits.length,
        prs: prs.length,
        milestones: milestonesUpdated,
      },
    };
  } catch (error: any) {
    logger.error('Failed to sync project', error, { projectId });
    return {
      success: false,
      projectId,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Sync all active student projects
 */
export async function syncAllActiveProjects(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ projectId: string; error: string }>;
}> {
  const result = {
    total: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ projectId: string; error: string }>,
  };

  try {
    // Get all active projects (IN_PROGRESS status)
    const activeProjects = await prisma.studentProject.findMany({
      where: {
        status: {
          in: ['IN_PROGRESS', 'BLOCKED'],
        },
      },
    });

    result.total = activeProjects.length;

    logger.info('Starting batch project sync', { total: activeProjects.length });

    // Sync projects sequentially to avoid rate limiting
    for (const project of activeProjects) {
      const syncResult = await syncProjectWithGitHub(project.id);

      if (syncResult.success) {
        result.succeeded++;
      } else {
        result.failed++;
        result.errors.push({
          projectId: project.id,
          error: syncResult.error || 'Unknown error',
        });
      }

      // Add small delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    logger.info('Batch project sync completed', result);

    return result;
  } catch (error: any) {
    logger.error('Batch project sync failed', error);
    throw error;
  }
}

/**
 * Fetch recent commits from a GitHub repository
 */
async function fetchRecentCommits(owner: string, repo: string, limit: number = 10) {
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: limit,
    });

    return data;
  } catch (error: any) {
    if (error.status === 404) {
      logger.warn('Repository not found or no access', { owner, repo });
      return [];
    }
    throw error;
  }
}

/**
 * Fetch pull requests from a GitHub repository
 */
async function fetchPullRequests(owner: string, repo: string) {
  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 50,
    });

    return data;
  } catch (error: any) {
    if (error.status === 404) {
      logger.warn('Repository not found or no access', { owner, repo });
      return [];
    }
    throw error;
  }
}

/**
 * Check if a file exists in the repository
 */
async function checkFileExists(
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Check if a branch has been merged to main/default branch
 */
async function checkBranchMerged(
  owner: string,
  repo: string,
  branch: string,
  baseBranch: string = 'main'
): Promise<boolean> {
  try {
    // Compare branches
    const { data } = await octokit.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${baseBranch}...${branch}`,
    });

    // If behind_by is 0 and ahead_by is 0, branch is merged or identical
    return data.behind_by === 0 && data.ahead_by === 0;
  } catch (error: any) {
    if (error.status === 404) {
      // Branch might not exist or was deleted after merge
      return true;
    }
    return false;
  }
}

/**
 * Check and auto-complete milestones based on GitHub activity
 */
async function checkMilestoneCompletion(
  project: StudentProject & { milestones: ProjectMilestone[] },
  commits: any[]
): Promise<number> {
  let completedCount = 0;

  const incompleteMilestones = project.milestones.filter((m) => !m.completed);

  for (const milestone of incompleteMilestones) {
    let shouldComplete = false;

    // Check commit message pattern
    if (milestone.linkedToCommitMsg && commits.length > 0) {
      try {
        const pattern = new RegExp(milestone.linkedToCommitMsg, 'i');
        shouldComplete = commits.some((c) =>
          pattern.test(c.commit.message)
        );
      } catch (error) {
        logger.warn('Invalid regex pattern in milestone', {
          milestoneId: milestone.id,
          pattern: milestone.linkedToCommitMsg,
        });
      }
    }

    // Check file existence
    if (!shouldComplete && milestone.linkedToFile) {
      const fileExists = await checkFileExists(
        project.repoOwner,
        project.repoName,
        milestone.linkedToFile
      );
      shouldComplete = fileExists;
    }

    // Check branch merge
    if (!shouldComplete && milestone.linkedToBranch) {
      const branchMerged = await checkBranchMerged(
        project.repoOwner,
        project.repoName,
        milestone.linkedToBranch,
        project.defaultBranch
      );
      shouldComplete = branchMerged;
    }

    // Complete the milestone if criteria met
    if (shouldComplete) {
      await prisma.projectMilestone.update({
        where: { id: milestone.id },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });

      completedCount++;

      logger.info('Milestone auto-completed', {
        projectId: project.id,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
      });
    }
  }

  return completedCount;
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 */
export function parseGitHubUrl(repoUrl: string): {
  owner: string;
  repo: string;
  fullName: string;
} | null {
  try {
    // Handle various GitHub URL formats:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git

    let cleanUrl = repoUrl.trim();

    // Convert SSH to HTTPS for parsing
    if (cleanUrl.startsWith('git@github.com:')) {
      cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
    }

    // Remove .git suffix
    cleanUrl = cleanUrl.replace(/\.git$/, '');

    // Extract owner and repo from URL
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return null;
    }

    const [, owner, repo] = match;

    return {
      owner,
      repo,
      fullName: `${owner}/${repo}`,
    };
  } catch (error) {
    logger.error('Failed to parse GitHub URL', error, { repoUrl });
    return null;
  }
}
