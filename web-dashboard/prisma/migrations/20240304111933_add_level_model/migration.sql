/*
  Warnings:

  - Added the required column `levelId` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "levelId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "levels" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_key" ON "levels"("name");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
