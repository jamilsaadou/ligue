-- CreateEnum
CREATE TYPE "AdminModule" AS ENUM (
  'statistics',
  'diagnostics',
  'users',
  'logs',
  'resources',
  'settings'
);

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "adminModules" "AdminModule"[] NOT NULL DEFAULT ARRAY[]::"AdminModule"[];

-- Preserve the current access of existing administrators.
UPDATE "User"
SET "adminModules" = ARRAY[
  'statistics',
  'diagnostics',
  'users',
  'logs',
  'resources',
  'settings'
]::"AdminModule"[]
WHERE "role" = 'admin';
