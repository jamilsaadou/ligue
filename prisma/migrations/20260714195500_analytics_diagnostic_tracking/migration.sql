-- CreateEnum
CREATE TYPE "DiagnosticAttemptStatus" AS ENUM ('started', 'completed');

-- AlterTable
ALTER TABLE "DiagnosticSubmission"
ADD COLUMN "attemptId" TEXT,
ADD COLUMN "sessionId" TEXT,
ADD COLUMN "durationMs" INTEGER;

-- AlterTable
ALTER TABLE "TrackingEvent"
ADD COLUMN "eventName" TEXT NOT NULL DEFAULT 'page_view',
ADD COLUMN "eventCategory" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "deviceType" TEXT,
ADD COLUMN "browser" TEXT,
ADD COLUMN "os" TEXT,
ADD COLUMN "language" TEXT,
ADD COLUMN "screen" TEXT,
ADD COLUMN "timezone" TEXT,
ADD COLUMN "utmSource" TEXT,
ADD COLUMN "utmMedium" TEXT,
ADD COLUMN "utmCampaign" TEXT,
ADD COLUMN "diagnosticId" TEXT,
ADD COLUMN "attemptId" TEXT,
ADD COLUMN "metadata" JSONB;

-- CreateTable
CREATE TABLE "DiagnosticAttempt" (
    "id" TEXT NOT NULL,
    "diagnosticId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "mode" TEXT NOT NULL,
    "status" "DiagnosticAttemptStatus" NOT NULL DEFAULT 'started',
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL,
    "totalScore" INTEGER,
    "maxScore" INTEGER,
    "level" TEXT,
    "durationMs" INTEGER,
    "referrer" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DiagnosticAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticSubmission_attemptId_key" ON "DiagnosticSubmission"("attemptId");
CREATE INDEX "DiagnosticSubmission_sessionId_idx" ON "DiagnosticSubmission"("sessionId");
CREATE INDEX "DiagnosticSubmission_level_idx" ON "DiagnosticSubmission"("level");
CREATE INDEX "DiagnosticAttempt_diagnosticId_idx" ON "DiagnosticAttempt"("diagnosticId");
CREATE INDEX "DiagnosticAttempt_status_idx" ON "DiagnosticAttempt"("status");
CREATE INDEX "DiagnosticAttempt_startedAt_idx" ON "DiagnosticAttempt"("startedAt");
CREATE INDEX "DiagnosticAttempt_sessionId_idx" ON "DiagnosticAttempt"("sessionId");
CREATE INDEX "DiagnosticAttempt_userId_idx" ON "DiagnosticAttempt"("userId");
CREATE INDEX "TrackingEvent_eventName_idx" ON "TrackingEvent"("eventName");
CREATE INDEX "TrackingEvent_sessionId_idx" ON "TrackingEvent"("sessionId");
CREATE INDEX "TrackingEvent_diagnosticId_idx" ON "TrackingEvent"("diagnosticId");
CREATE INDEX "TrackingEvent_attemptId_idx" ON "TrackingEvent"("attemptId");

-- AddForeignKey
ALTER TABLE "DiagnosticSubmission" ADD CONSTRAINT "DiagnosticSubmission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "DiagnosticAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
