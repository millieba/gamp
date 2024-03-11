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

export interface Preferences {
  excludeLanguages: string[];
  showStrictStreak: boolean;
  showWorkdayStreak: boolean;
}

export async function savePreferencesToDB(accountId: string, preferences: Preferences) {
  try {
    console.log(preferences.excludeLanguages, preferences.showStrictStreak, preferences.showWorkdayStreak);

    const updatedPreferences = await prisma.userPreferences.update({
      where: { accountId: accountId },
      data: {
        excludeLanguages: preferences.excludeLanguages,
        showStrictStreak: preferences.showStrictStreak,
        showWorkdayStreak: preferences.showWorkdayStreak,
      },
      select: {
        excludeLanguages: true,
        showStrictStreak: true,
        showWorkdayStreak: true,
      },
    });

    console.log(`Preferences for account ${accountId} have been updated:`, updatedPreferences);

    return updatedPreferences;
  } catch (error) {
    console.error(`An error occurred while saving preferences for account ${accountId} to the database:`, error);
    throw error;
  }
}
