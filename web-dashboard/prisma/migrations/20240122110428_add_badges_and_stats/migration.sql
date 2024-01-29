-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_stats" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "commit_count" INTEGER,
    "repo_count" INTEGER,
    "issue_count" INTEGER,
    "languages_count" INTEGER,

    CONSTRAINT "github_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammingLanguage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code_lines" INTEGER NOT NULL,
    "github_stats_id" TEXT NOT NULL,

    CONSTRAINT "ProgrammingLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToBadge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "github_stats_account_id_key" ON "github_stats"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToBadge_AB_unique" ON "_AccountToBadge"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToBadge_B_index" ON "_AccountToBadge"("B");

-- AddForeignKey
ALTER TABLE "github_stats" ADD CONSTRAINT "github_stats_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammingLanguage" ADD CONSTRAINT "ProgrammingLanguage_github_stats_id_fkey" FOREIGN KEY ("github_stats_id") REFERENCES "github_stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBadge" ADD CONSTRAINT "_AccountToBadge_A_fkey" FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBadge" ADD CONSTRAINT "_AccountToBadge_B_fkey" FOREIGN KEY ("B") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
