/*
  Warnings:

  - You are about to drop the `morning_commit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `night_commit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "morning_commit" DROP CONSTRAINT "morning_commit_github_stats_id_fkey";

-- DropForeignKey
ALTER TABLE "night_commit" DROP CONSTRAINT "night_commit_github_stats_id_fkey";

-- AlterTable
ALTER TABLE "github_stats" ADD COLUMN     "morning_commit_count" INTEGER,
ADD COLUMN     "night_commit_count" INTEGER;

-- DropTable
DROP TABLE "morning_commit";

-- DropTable
DROP TABLE "night_commit";
