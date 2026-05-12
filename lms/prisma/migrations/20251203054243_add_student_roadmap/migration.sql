-- CreateEnum
CREATE TYPE "RoadmapItemType" AS ENUM ('COURSE', 'SKILL', 'PROJECT', 'MILESTONE');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateTable
CREATE TABLE "StudentRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "itemType" "RoadmapItemType" NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "order" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentRoadmap_userId_idx" ON "StudentRoadmap"("userId");

-- CreateIndex
CREATE INDEX "StudentRoadmap_status_idx" ON "StudentRoadmap"("status");

-- CreateIndex
CREATE INDEX "StudentRoadmap_userId_order_idx" ON "StudentRoadmap"("userId", "order");

-- AddForeignKey
ALTER TABLE "StudentRoadmap" ADD CONSTRAINT "StudentRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
