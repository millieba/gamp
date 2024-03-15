-- AlterTable
ALTER TABLE "UserPreferences" ALTER COLUMN "exclude_languages" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "show_strict_streak" SET DEFAULT true,
ALTER COLUMN "show_workday_streak" SET DEFAULT true;
