/*
  Warnings:

  - The `expiresAt` column on the `OAuthToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OAuthToken" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "refreshToken" DROP NOT NULL,
DROP COLUMN "expiresAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OAuthToken_userId_idx" ON "OAuthToken"("userId");

-- CreateIndex
CREATE INDEX "OAuthToken_provider_idx" ON "OAuthToken"("provider");

-- CreateIndex
CREATE INDEX "OAuthToken_expiresAt_idx" ON "OAuthToken"("expiresAt");
