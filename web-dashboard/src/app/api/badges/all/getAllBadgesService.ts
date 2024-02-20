import prisma from "@/utils/prisma";

export async function getBadgesFromDB(accountId: string) {
  try {
    const badges = await prisma.badge.findMany();
    return badges;
  } catch (error) {
    console.error(`An error occurred while getting badges for account ${accountId} from the database:`, error);
    throw error;
  }
}
