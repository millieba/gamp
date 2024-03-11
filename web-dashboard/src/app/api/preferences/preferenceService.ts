import prisma from "@/utils/prisma";

export async function getPreferencesFromDB(accountId: string) {
  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { accountId: accountId },
    });
    return { preferences: preferences };
  } catch (error) {
    console.error(`An error occurred while getting preferences for account ${accountId} from the database:`, error);
    throw error;
  }
}
