import prisma from "@/utils/prisma";

export async function getPreferencesFromDB(accountId: string) {
  try {
    const preferences = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        preferences: {
          select: {
            excludeLanguages: true,
            showStrictStreak: true,
            showWorkdayStreak: true,
          },
        },
      },
    });
    return preferences;
  } catch (error) {
    console.error(`An error occurred while getting preferences for account ${accountId} from the database:`, error);
    throw error;
  }
}
