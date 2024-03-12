/*
  Warnings:

  - You are about to drop the `UserPreferences` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPreferences" DROP CONSTRAINT "UserPreferences_account_id_fkey";

-- DropTable
DROP TABLE "UserPreferences";

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "exclude_languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "show_strict_streak" BOOLEAN NOT NULL DEFAULT true,
    "show_workday_streak" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_account_id_key" ON "user_preferences"("account_id");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
