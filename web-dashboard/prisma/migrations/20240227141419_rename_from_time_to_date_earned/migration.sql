/*
  Warnings:

  - You are about to drop the column `time_earned` on the `badge_awards` table. All the data in the column will be lost.
  - Added the required column `date_earned` to the `badge_awards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "badge_awards" DROP COLUMN "time_earned",
ADD COLUMN     "date_earned" TIMESTAMP(3) NOT NULL;
