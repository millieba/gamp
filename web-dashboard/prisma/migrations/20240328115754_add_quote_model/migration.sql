-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "last_quote_id" TEXT,
ADD COLUMN     "skippedQuotes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_last_quote_id_fkey" FOREIGN KEY ("last_quote_id") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
