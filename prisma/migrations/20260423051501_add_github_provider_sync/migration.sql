-- CreateEnum
CREATE TYPE "ProviderKey" AS ENUM ('GITHUB', 'LEETCODE', 'NEETCODE', 'GENERIC_CUSTOM', 'COMPETITIVE_PROGRAMMING', 'MANUAL');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('OFFICIAL_API', 'OAUTH', 'PUBLIC_PROFILE', 'SCRAPE', 'USER_UPLOAD', 'MANUAL');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ProviderAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ProviderKey" NOT NULL,
    "externalId" TEXT,
    "displayName" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "connectionStatus" TEXT NOT NULL DEFAULT 'disconnected',
    "dataSourceType" "DataSourceType" NOT NULL DEFAULT 'MANUAL',
    "syncCadenceMinutes" INTEGER DEFAULT 360,
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSyncJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "ProviderKey" NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "provider" "ProviderKey" NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderAccount_userId_idx" ON "ProviderAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderAccount_userId_provider_key" ON "ProviderAccount"("userId", "provider");

-- CreateIndex
CREATE INDEX "ProviderSyncJob_userId_status_idx" ON "ProviderSyncJob"("userId", "status");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_date_idx" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_provider_key" ON "DailyActivity"("userId", "date", "provider");

-- AddForeignKey
ALTER TABLE "ProviderAccount" ADD CONSTRAINT "ProviderAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSyncJob" ADD CONSTRAINT "ProviderSyncJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
