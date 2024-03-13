-- CreateTable
CREATE TABLE "assigned_issues" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "number" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "assigned_issues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "assigned_issues" ADD CONSTRAINT "assigned_issues_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
