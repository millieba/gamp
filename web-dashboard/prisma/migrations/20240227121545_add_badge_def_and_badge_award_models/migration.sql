/*
  Warnings:

  - You are about to drop the `_AccountToBadge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `badges` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccountToBadge" DROP CONSTRAINT "_AccountToBadge_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToBadge" DROP CONSTRAINT "_AccountToBadge_B_fkey";

-- DropTable
DROP TABLE "_AccountToBadge";

-- DropTable
DROP TABLE "badges";

-- CreateTable
CREATE TABLE "badge_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_awards" (
    "id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "time_earned" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "badge_awards_badge_id_key" ON "badge_awards"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "badge_awards_account_id_key" ON "badge_awards"("account_id");

-- AddForeignKey
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badge_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "badge_awards" ADD CONSTRAINT "badge_awards_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
