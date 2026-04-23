/**
 * GitHub Webhook Event Handlers
 * 
 * Processes real-time webhook events from GitHub to update student projects
 */

import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

/**
 * Handle push events
 * - Extract commits and update project
 * - Check milestone auto-completion
 * - Update last commit info
 */
export async function handlePushEvent(payload: any) {
  const repoFullName = payload.repository.full_name;
  const commits = payload.commits || [];
  const pusher = payload.pusher?.name;
  const ref = payload.ref; // e.g., "refs/heads/main"
  const branch = ref?.replace('refs/heads/', '');

  logger.info('Processing push event', {
    repo: repoFullName,
    branch,
    commits: commits.length,
    pusher,
  });

  // Find project by repo full name
  const project = await prisma.studentProject.findFirst({
    where: { repoFullName },
    include: { milestones: true },
  });

  if (!project) {
    logger.info('No project found for repository', { repoFullName });
    return { processed: false, reason: 'No project linked to this repository' };
  }

  // Only process pushes to the default branch
  if (branch !== project.defaultBranch) {
    logger.info('Ignoring push to non-default branch', { branch, defaultBranch: project.defaultBranch });
    return { processed: false, reason: `Ignoring push to ${branch} (not default branch)` };
  }

  // Get latest commit
  const latestCommit = commits[commits.length - 1];
  
  if (!latestCommit) {
    logger.warn('Push event has no commits', { repoFullName });
    return { processed: false, reason: 'No commits in push event' };
  }

  // Update project with latest commit info
  const updatedProject = await prisma.studentProject.update({
    where: { id: project.id },
    data: {
      lastCommitSha: latestCommit.id,
      lastCommitMsg: latestCommit.message,
      lastCommitDate: new Date(latestCommit.timestamp),
      totalCommits: { increment: commits.length },
      lastSyncedAt: new Date(),
    },
  });

  // Create activity record for this push
  await prisma.projectActivity.create({
    data: {
      projectId: project.id,
      activityType: 'COMMIT',
      title: commits.length === 1 ? 'Pushed 1 commit' : `Pushed ${commits.length} commits`,
      description: latestCommit.message,
      metadata: {
        commitSha: latestCommit.id,
        commitCount: commits.length,
        author: latestCommit.author?.name,
        branch,
      },
      url: latestCommit.url,
      timestamp: new Date(latestCommit.timestamp),
    },
  });

  // Check milestone auto-completion
  let completedMilestones = 0;

  for (const milestone of project.milestones) {
    if (milestone.completed) continue; // Already completed

    let shouldComplete = false;

    // Check commit message pattern
    if (milestone.linkedToCommitMsg) {
      const regex = new RegExp(milestone.linkedToCommitMsg, 'i');
      const matchingCommit = commits.find((commit: any) => 
        regex.test(commit.message)
      );
      
      if (matchingCommit) {
        shouldComplete = true;
        logger.info('Milestone matched by commit message', {
          milestoneTitle: milestone.title,
          commitMsg: matchingCommit.message,
          pattern: milestone.linkedToCommitMsg,
        });
      }
    }

    // Check file existence (added/modified files)
    if (milestone.linkedToFile && !shouldComplete) {
      const filePattern = milestone.linkedToFile;
      const matchingCommit = commits.find((commit: any) => {
        const allFiles = [
          ...(commit.added || []),
          ...(commit.modified || []),
        ];
        return allFiles.some((file: string) => 
          file.includes(filePattern) || new RegExp(filePattern).test(file)
        );
      });

      if (matchingCommit) {
        shouldComplete = true;
        logger.info('Milestone matched by file', {
          milestoneTitle: milestone.title,
          filePattern,
        });
      }
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

      // Create activity record for milestone completion
      await prisma.projectActivity.create({
        data: {
          projectId: project.id,
          activityType: 'MILESTONE_COMPLETED',
          title: `Completed milestone: ${milestone.title}`,
          description: milestone.description,
          metadata: {
            milestoneId: milestone.id,
            triggeredBy: 'push',
          },
          timestamp: new Date(),
        },
      });

      completedMilestones++;
    }
  }

  logger.info('Push event processed', {
    projectId: project.id,
    commitsProcessed: commits.length,
    milestonesCompleted: completedMilestones,
  });

  return {
    processed: true,
    projectId: project.id,
    commitsProcessed: commits.length,
    milestonesCompleted: completedMilestones,
    latestCommit: {
      sha: latestCommit.id,
      message: latestCommit.message,
      author: latestCommit.author?.name,
      timestamp: latestCommit.timestamp,
    },
  };
}

/**
 * Handle pull request events
 * - Track PR opens/closes/merges
 * - Check branch-based milestone completion
 */
export async function handlePullRequestEvent(payload: any) {
  const action = payload.action; // opened, closed, reopened, etc.
  const pr = payload.pull_request;
  const repoFullName = payload.repository.full_name;
  const prNumber = pr.number;
  const prState = pr.state; // open or closed
  const merged = pr.merged || false;

  logger.info('Processing pull request event', {
    repo: repoFullName,
    action,
    prNumber,
    merged,
  });

  // Find project by repo full name
  const project = await prisma.studentProject.findFirst({
    where: { repoFullName },
    include: { milestones: true },
  });

  if (!project) {
    logger.info('No project found for repository', { repoFullName });
    return { processed: false, reason: 'No project linked to this repository' };
  }

  // Update PR counts based on action
  let updateData: any = { lastSyncedAt: new Date() };

  if (action === 'opened') {
    updateData.openPRs = { increment: 1 };
  } else if (action === 'closed') {
    if (merged) {
      updateData.closedPRs = { increment: 1 };
      updateData.openPRs = { decrement: 1 };
    } else {
      updateData.openPRs = { decrement: 1 };
    }
  } else if (action === 'reopened') {
    updateData.openPRs = { increment: 1 };
  }

  await prisma.studentProject.update({
    where: { id: project.id },
    data: updateData,
  });

  // Create activity record for PR event
  let activityType: 'PULL_REQUEST_OPENED' | 'PULL_REQUEST_MERGED' | 'PULL_REQUEST_CLOSED';
  let activityTitle: string;

  if (action === 'opened') {
    activityType = 'PULL_REQUEST_OPENED';
    activityTitle = `Opened pull request #${prNumber}`;
  } else if (action === 'closed' && merged) {
    activityType = 'PULL_REQUEST_MERGED';
    activityTitle = `Merged pull request #${prNumber}`;
  } else if (action === 'closed' && !merged) {
    activityType = 'PULL_REQUEST_CLOSED';
    activityTitle = `Closed pull request #${prNumber}`;
  } else if (action === 'reopened') {
    activityType = 'PULL_REQUEST_OPENED';
    activityTitle = `Reopened pull request #${prNumber}`;
  } else {
    // For other actions, we'll skip creating an activity
    logger.info('Skipping activity creation for PR action', { action });
    activityType = 'PULL_REQUEST_OPENED'; // Default (won't be used)
    activityTitle = '';
  }

  if (activityTitle) {
    await prisma.projectActivity.create({
      data: {
        projectId: project.id,
        activityType,
        title: activityTitle,
        description: pr.title,
        metadata: {
          prNumber,
          prState,
          merged,
          headBranch: pr.head.ref,
          baseBranch: pr.base.ref,
        },
        url: pr.html_url,
        timestamp: new Date(),
      },
    });
  }

  // Check branch-based milestone completion (when PR is merged)
  let completedMilestones = 0;

  if (merged) {
    const headBranch = pr.head.ref; // Branch that was merged

    for (const milestone of project.milestones) {
      if (milestone.completed) continue;

      // Check if milestone is linked to this branch
      if (milestone.linkedToBranch) {
        const branchPattern = new RegExp(milestone.linkedToBranch, 'i');
        if (branchPattern.test(headBranch)) {
          await prisma.projectMilestone.update({
            where: { id: milestone.id },
            data: {
              completed: true,
              completedAt: new Date(),
            },
          });

          // Create activity record for milestone completion
          await prisma.projectActivity.create({
            data: {
              projectId: project.id,
              activityType: 'MILESTONE_COMPLETED',
              title: `Completed milestone: ${milestone.title}`,
              description: milestone.description,
              metadata: {
                milestoneId: milestone.id,
                triggeredBy: 'pull_request_merge',
                prNumber,
                branch: headBranch,
              },
              timestamp: new Date(),
            },
          });

          completedMilestones++;

          logger.info('Milestone completed via PR merge', {
            milestoneTitle: milestone.title,
            branch: headBranch,
            prNumber,
          });
        }
      }
    }
  }

  logger.info('Pull request event processed', {
    projectId: project.id,
    action,
    merged,
    milestonesCompleted: completedMilestones,
  });

  return {
    processed: true,
    projectId: project.id,
    action,
    prNumber,
    merged,
    milestonesCompleted: completedMilestones,
  };
}

/**
 * Handle deployment status events
 * - Track deployment success/failure
 * - Update deployment URL
 */
export async function handleDeploymentEvent(payload: any) {
  const deploymentStatus = payload.deployment_status;
  const deployment = payload.deployment;
  const repoFullName = payload.repository.full_name;
  
  const state = deploymentStatus.state; // success, failure, pending, etc.
  const targetUrl = deploymentStatus.target_url || deployment.payload?.web_url;
  const environment = deployment.environment || 'production';

  logger.info('Processing deployment status event', {
    repo: repoFullName,
    state,
    environment,
  });

  // Find project by repo full name
  const project = await prisma.studentProject.findFirst({
    where: { repoFullName },
  });

  if (!project) {
    logger.info('No project found for repository', { repoFullName });
    return { processed: false, reason: 'No project linked to this repository' };
  }

  // Only track production deployments
  if (environment !== 'production' && environment !== 'Production') {
    logger.info('Ignoring non-production deployment', { environment });
    return { processed: false, reason: `Ignoring ${environment} deployment` };
  }

  // Map GitHub deployment status to our enum
  const deploymentStatusMap: Record<string, string> = {
    success: 'SUCCESS',
    failure: 'FAILURE',
    error: 'FAILURE',
    pending: 'PENDING',
    in_progress: 'PENDING',
    queued: 'PENDING',
  };

  const mappedStatus = deploymentStatusMap[state] || 'PENDING';

  // Update project deployment info
  await prisma.studentProject.update({
    where: { id: project.id },
    data: {
      lastDeployment: new Date(),
      deploymentUrl: targetUrl || project.deploymentUrl,
      deploymentStatus: mappedStatus as any,
      lastSyncedAt: new Date(),
    },
  });

  // Create activity record for deployment (only for success/failure, not pending)
  if (mappedStatus === 'SUCCESS' || mappedStatus === 'FAILURE') {
    const activityType = mappedStatus === 'SUCCESS' ? 'DEPLOYMENT_SUCCESS' : 'DEPLOYMENT_FAILED';
    const activityTitle = mappedStatus === 'SUCCESS'
      ? 'Deployment succeeded'
      : 'Deployment failed';

    await prisma.projectActivity.create({
      data: {
        projectId: project.id,
        activityType,
        title: activityTitle,
        description: `Deployment to ${environment}`,
        metadata: {
          environment,
          state,
        },
        url: targetUrl,
        timestamp: new Date(),
      },
    });
  }

  logger.info('Deployment status updated', {
    projectId: project.id,
    status: mappedStatus,
    url: targetUrl,
  });

  return {
    processed: true,
    projectId: project.id,
    status: mappedStatus,
    deploymentUrl: targetUrl,
  };
}
