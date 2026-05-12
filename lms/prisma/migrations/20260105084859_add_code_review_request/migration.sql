/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETING', 'DEADLINE', 'LIVE_CODING', 'QA_SESSION', 'WORKSHOP', 'STUDY_TIME', 'EXAM', 'HOLIDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'COURSE', 'PRIVATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('COMMIT', 'PULL_REQUEST_OPENED', 'PULL_REQUEST_MERGED', 'PULL_REQUEST_CLOSED', 'DEPLOYMENT_SUCCESS', 'DEPLOYMENT_FAILED', 'MILESTONE_COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'COMPLETED', 'CLOSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoadmapItemType" ADD VALUE 'EXERCISE';
ALTER TYPE "RoadmapItemType" ADD VALUE 'DESIGN';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "maxStudents" INTEGER;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "StudentRoadmap" ADD COLUMN     "difficulty" INTEGER,
ADD COLUMN     "estimatedHours" INTEGER,
ADD COLUMN     "phase" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "skillKeys" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "clerkId" TEXT,
ADD COLUMN     "githubEmail" TEXT,
ADD COLUMN     "githubPersonalAccessToken" TEXT,
ADD COLUMN     "githubRepoUrl" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "githubWebhookToken" TEXT,
ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleCalendarLastSync" TIMESTAMP(3),
ADD COLUMN     "googleCalendarSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "longTermGoal" TEXT,
ADD COLUMN     "mediumTermGoal" TEXT,
ADD COLUMN     "roadmapDocumentId" TEXT,
ADD COLUMN     "shortTermGoal" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentStep" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepKind" TEXT NOT NULL,
    "rawAnswer" JSONB NOT NULL,
    "gradeResult" JSONB,
    "skillUpdates" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "mastery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,

    CONSTRAINT "UserSkillMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionToken" TEXT,
    "metadata" JSONB,

    CONSTRAINT "LoginSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "action" TEXT,
    "repository" TEXT NOT NULL,
    "repoUrl" TEXT,
    "payload" JSONB NOT NULL,
    "commitCount" INTEGER,
    "additions" INTEGER,
    "deletions" INTEGER,
    "branch" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ActivityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedRepository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ConnectedRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "eventType" "EventType" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByRole" "Role" NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "googleEventId" TEXT,
    "googleCalendarId" TEXT,
    "courseId" TEXT,
    "attendees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "reminderMinutes" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGoogleCalendarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarEventId" TEXT NOT NULL,
    "googleEventId" TEXT NOT NULL,
    "googleCalendarId" TEXT NOT NULL DEFAULT 'primary',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoogleCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "repoOwner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "lastCommitSha" TEXT,
    "lastCommitMsg" TEXT,
    "lastCommitDate" TIMESTAMP(3),
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "openPRs" INTEGER NOT NULL DEFAULT 0,
    "closedPRs" INTEGER NOT NULL DEFAULT 0,
    "lastDeployment" TIMESTAMP(3),
    "deploymentUrl" TEXT,
    "deploymentStatus" "DeploymentStatus",
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "linkedToBranch" TEXT,
    "linkedToFile" TEXT,
    "linkedToCommitMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "url" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReviewRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "repoUrl" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentSession_userId_sessionType_idx" ON "AssessmentSession"("userId", "sessionType");

-- CreateIndex
CREATE INDEX "AssessmentSession_status_idx" ON "AssessmentSession"("status");

-- CreateIndex
CREATE INDEX "AssessmentResponse_sessionId_idx" ON "AssessmentResponse"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_sessionId_stepId_key" ON "AssessmentResponse"("sessionId", "stepId");

-- CreateIndex
CREATE INDEX "UserSkillMastery_userId_idx" ON "UserSkillMastery"("userId");

-- CreateIndex
CREATE INDEX "UserSkillMastery_skillKey_idx" ON "UserSkillMastery"("skillKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillMastery_userId_skillKey_key" ON "UserSkillMastery"("userId", "skillKey");

-- CreateIndex
CREATE UNIQUE INDEX "LoginSession_sessionToken_key" ON "LoginSession"("sessionToken");

-- CreateIndex
CREATE INDEX "LoginSession_userId_idx" ON "LoginSession"("userId");

-- CreateIndex
CREATE INDEX "LoginSession_loginAt_idx" ON "LoginSession"("loginAt");

-- CreateIndex
CREATE INDEX "LoginSession_isActive_idx" ON "LoginSession"("isActive");

-- CreateIndex
CREATE INDEX "LoginSession_userId_loginAt_idx" ON "LoginSession"("userId", "loginAt");

-- CreateIndex
CREATE INDEX "GitHubEvent_userId_idx" ON "GitHubEvent"("userId");

-- CreateIndex
CREATE INDEX "GitHubEvent_eventType_idx" ON "GitHubEvent"("eventType");

-- CreateIndex
CREATE INDEX "GitHubEvent_timestamp_idx" ON "GitHubEvent"("timestamp");

-- CreateIndex
CREATE INDEX "GitHubEvent_userId_timestamp_idx" ON "GitHubEvent"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "ActivityMetric_userId_idx" ON "ActivityMetric"("userId");

-- CreateIndex
CREATE INDEX "ActivityMetric_metricType_idx" ON "ActivityMetric"("metricType");

-- CreateIndex
CREATE INDEX "ActivityMetric_date_idx" ON "ActivityMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityMetric_userId_metricType_date_period_key" ON "ActivityMetric"("userId", "metricType", "date", "period");

-- CreateIndex
CREATE INDEX "ConnectedRepository_userId_idx" ON "ConnectedRepository"("userId");

-- CreateIndex
CREATE INDEX "ConnectedRepository_isActive_idx" ON "ConnectedRepository"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedRepository_userId_repoName_key" ON "ConnectedRepository"("userId", "repoName");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_googleEventId_key" ON "CalendarEvent"("googleEventId");

-- CreateIndex
CREATE INDEX "CalendarEvent_createdBy_idx" ON "CalendarEvent"("createdBy");

-- CreateIndex
CREATE INDEX "CalendarEvent_courseId_idx" ON "CalendarEvent"("courseId");

-- CreateIndex
CREATE INDEX "CalendarEvent_startTime_idx" ON "CalendarEvent"("startTime");

-- CreateIndex
CREATE INDEX "CalendarEvent_eventType_idx" ON "CalendarEvent"("eventType");

-- CreateIndex
CREATE INDEX "CalendarEvent_visibility_idx" ON "CalendarEvent"("visibility");

-- CreateIndex
CREATE INDEX "UserGoogleCalendarEvent_userId_idx" ON "UserGoogleCalendarEvent"("userId");

-- CreateIndex
CREATE INDEX "UserGoogleCalendarEvent_calendarEventId_idx" ON "UserGoogleCalendarEvent"("calendarEventId");

-- CreateIndex
CREATE INDEX "UserGoogleCalendarEvent_googleEventId_idx" ON "UserGoogleCalendarEvent"("googleEventId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoogleCalendarEvent_userId_calendarEventId_key" ON "UserGoogleCalendarEvent"("userId", "calendarEventId");

-- CreateIndex
CREATE INDEX "StudentProject_userId_idx" ON "StudentProject"("userId");

-- CreateIndex
CREATE INDEX "StudentProject_status_idx" ON "StudentProject"("status");

-- CreateIndex
CREATE INDEX "StudentProject_isCurrent_idx" ON "StudentProject"("isCurrent");

-- CreateIndex
CREATE INDEX "StudentProject_userId_isCurrent_idx" ON "StudentProject"("userId", "isCurrent");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_idx" ON "ProjectMilestone"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMilestone_projectId_order_idx" ON "ProjectMilestone"("projectId", "order");

-- CreateIndex
CREATE INDEX "ProjectActivity_projectId_idx" ON "ProjectActivity"("projectId");

-- CreateIndex
CREATE INDEX "ProjectActivity_projectId_timestamp_idx" ON "ProjectActivity"("projectId", "timestamp");

-- CreateIndex
CREATE INDEX "ProjectActivity_activityType_idx" ON "ProjectActivity"("activityType");

-- CreateIndex
CREATE INDEX "CodeReviewRequest_userId_idx" ON "CodeReviewRequest"("userId");

-- CreateIndex
CREATE INDEX "CodeReviewRequest_status_idx" ON "CodeReviewRequest"("status");

-- CreateIndex
CREATE INDEX "CodeReviewRequest_reviewerId_idx" ON "CodeReviewRequest"("reviewerId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillMastery" ADD CONSTRAINT "UserSkillMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginSession" ADD CONSTRAINT "LoginSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubEvent" ADD CONSTRAINT "GitHubEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityMetric" ADD CONSTRAINT "ActivityMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedRepository" ADD CONSTRAINT "ConnectedRepository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoogleCalendarEvent" ADD CONSTRAINT "UserGoogleCalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoogleCalendarEvent" ADD CONSTRAINT "UserGoogleCalendarEvent_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProject" ADD CONSTRAINT "StudentProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMilestone" ADD CONSTRAINT "ProjectMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewRequest" ADD CONSTRAINT "CodeReviewRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewRequest" ADD CONSTRAINT "CodeReviewRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudentProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeReviewRequest" ADD CONSTRAINT "CodeReviewRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
