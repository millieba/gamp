-- CreateTable
CREATE TABLE "daily_modifications" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changed_files" INTEGER NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "daily_modifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "daily_modifications" ADD CONSTRAINT "daily_modifications_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
