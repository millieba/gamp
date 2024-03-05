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

    const newLevel = levels.find((level) => {
      // Returns the first level that satisfies the condition below. Since we sort in descending order of points, this will be the highest level the user qualifies for
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

export async function getLevelFromDB(accountId: string) {
  try {
    const currentLevel = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        totalPoints: true,
        level: true,
      },
    });

    if (!currentLevel) {
      throw new Error(`Account with ID ${accountId} not found.`);
    }

    const nextLevelId = currentLevel.level.id + 1;

    const nextLevel = await prisma.level.findUnique({
      where: { id: nextLevelId },
    });

    return { currentLevel: currentLevel.level, totalPoints: currentLevel.totalPoints, nextLevel: nextLevel };
  } catch (error) {
    console.error(`An error occurred while getting levels for account ${accountId} from the database:`, error);
    throw error;
  }
}
