-- DropForeignKey
ALTER TABLE "programming_languages" DROP CONSTRAINT "programming_languages_github_stats_id_fkey";

-- AddForeignKey
ALTER TABLE "programming_languages" ADD CONSTRAINT "programming_languages_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
