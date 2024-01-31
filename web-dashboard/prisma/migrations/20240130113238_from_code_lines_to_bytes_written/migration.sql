/*
  Warnings:

  - You are about to drop the column `code_lines` on the `ProgrammingLanguage` table. All the data in the column will be lost.
  - Added the required column `bytes_written` to the `ProgrammingLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProgrammingLanguage" DROP COLUMN "code_lines",
ADD COLUMN     "bytes_written" INTEGER NOT NULL;
