import prisma from "@/utils/prisma";

export async function checkLevel(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        totalPoints: true,
        levelId: true,
      },
    });

    if (!account) {
      throw new Error(`Account with id ${accountId} not found.`);
    }

    const levels = await prisma.level.findMany({
      orderBy: { threshold: "desc" }, // Sort levels by threshold in descending order
    });

    // Find the new level based on total points
    const newLevel = levels.find((level) => {
      return account.totalPoints >= level.threshold;
    });

    if (!newLevel || account.levelId === newLevel.id) {
      return; // If there's no new level or it's not higher than the current level, return early
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        level: {
          connect: { id: newLevel.id }, // Connect the new level
        },
      },
    });
  } catch (error) {
    console.error(`An error occurred while checking level for account ${accountId}:`, error);
    throw error;
  }
}
