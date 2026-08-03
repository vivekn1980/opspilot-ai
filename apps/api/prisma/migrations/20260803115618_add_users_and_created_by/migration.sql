-- AlterTable
ALTER TABLE "CapacityReport" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Change" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "CustomerUpdate" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Doc" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "ExecutiveReport" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Metric" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Risk" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Runbook" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "RunbookRun" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "ServiceReviewReport" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "ShiftHandover" ADD COLUMN "createdById" TEXT;

-- AlterTable
ALTER TABLE "Sop" ADD COLUMN "createdById" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
