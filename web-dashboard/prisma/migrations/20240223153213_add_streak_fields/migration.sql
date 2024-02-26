-- AlterTable
ALTER TABLE "github_stats" ADD COLUMN     "strict_streak" INTEGER,
ADD COLUMN     "strict_streak_to_continue" INTEGER,
ADD COLUMN     "workday_streak" INTEGER,
ADD COLUMN     "workday_streak_to_continue" INTEGER;
