/*
  Warnings:

  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_last_quote_id_fkey";

-- DropTable
DROP TABLE "Quote";

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_last_quote_id_fkey" FOREIGN KEY ("last_quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
