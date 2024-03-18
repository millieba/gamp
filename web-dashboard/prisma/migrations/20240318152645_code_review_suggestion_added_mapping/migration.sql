/*
  Warnings:

  - You are about to drop the column `closedAt` on the `assigned_issues` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `assigned_issues` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `assigned_issues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assigned_issues" DROP COLUMN "closedAt",
DROP COLUMN "createdAt",
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL;
