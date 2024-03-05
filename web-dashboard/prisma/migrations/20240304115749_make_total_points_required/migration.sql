/*
  Warnings:

  - Made the column `total_points` on table `accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "total_points" SET NOT NULL;
