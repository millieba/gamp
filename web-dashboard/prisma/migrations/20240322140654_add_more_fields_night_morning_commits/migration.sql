-- CreateTable
CREATE TABLE "night_commit" (
    "id" TEXT NOT NULL,
    "oid" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "committed_date" TIMESTAMP(3) NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "night_commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "morning_commit" (
    "id" TEXT NOT NULL,
    "oid" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "committed_date" TIMESTAMP(3) NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "morning_commit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "night_commit" ADD CONSTRAINT "night_commit_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "morning_commit" ADD CONSTRAINT "morning_commit_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
