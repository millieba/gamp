-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "totalPoints" INTEGER DEFAULT 0,
ALTER COLUMN "levelId" SET DEFAULT 1;
