/*
  Warnings:

  - You are about to drop the column `changed_files` on the `daily_modifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_modifications" DROP COLUMN "changed_files";
