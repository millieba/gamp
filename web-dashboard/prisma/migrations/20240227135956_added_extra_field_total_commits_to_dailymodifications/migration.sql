/*
  Warnings:

  - Added the required column `total_commits` to the `daily_modifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "daily_modifications" ADD COLUMN     "total_commits" INTEGER NOT NULL;
