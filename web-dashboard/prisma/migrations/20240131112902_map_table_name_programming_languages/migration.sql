/*
  Warnings:

  - You are about to drop the `ProgrammingLanguage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProgrammingLanguage" DROP CONSTRAINT "ProgrammingLanguage_github_stats_id_fkey";

-- DropTable
DROP TABLE "ProgrammingLanguage";

-- CreateTable
CREATE TABLE "programming_languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bytes_written" INTEGER NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "programming_languages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "programming_languages" ADD CONSTRAINT "programming_languages_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
