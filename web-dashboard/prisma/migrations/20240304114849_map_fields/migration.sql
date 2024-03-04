/*
  Warnings:

  - You are about to drop the column `levelId` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `totalPoints` on the `accounts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_levelId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "levelId",
DROP COLUMN "totalPoints",
ADD COLUMN     "level_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "total_points" INTEGER DEFAULT 0;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
