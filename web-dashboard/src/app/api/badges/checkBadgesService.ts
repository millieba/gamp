import prisma from "@/utils/prisma";
import { Commit } from "../commits/commitsService";

async function checkCommitCountBadges(commits: Commit[], accountId: string) {
  try {
    // Delete any existing badge awards, as we check all badges each time we sync and don't want duplicates
    await prisma.badgeAward.deleteMany({
      where: { accountId },
    });
    // Fetch all badges of type "commits_count" from the database
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "commits_count" },
    });

    const commitCount = commits.length;

    for (const badge of badges) {
      if (commitCount >= badge.threshold) {
        const thresholdIndex = commitCount - badge.threshold; // Get the index of the commit at the threshold, e.g. a user's 100th commit

        const dateEarned = commits[thresholdIndex]?.committedDate || new Date();

        // Create a new BadgeAward instance
        const badgeAward = await prisma.badgeAward.create({
          data: {
            badgeId: badge.id,
            accountId: accountId,
            dateEarned: dateEarned,
          },
        });

        // Fetch the account and update its list of earned badges
        await prisma.account.update({
          where: { id: accountId },
          data: {
            badges: {
              connect: { id: badgeAward.id }, // Connect the new BadgeAward to the account
            },
          },
        });
      }
    }

    await updateTotalPoints(accountId); // Update totalPoints after checking badges
  } catch (error) {
    console.error(`An error occurred while checking commit count badges for account ${accountId}:`, error);
    throw error;
  }
}

async function updateTotalPoints(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        badges: {
          include: {
            badgeDefinition: true, // Include associated BadgeDefinition for each BadgeAward
          },
        },
      },
    });

    if (!account) {
      throw new Error(`Account with id ${accountId} not found.`);
    }

    let totalPoints = 0;
    for (const badge of account.badges) {
      if (badge.badgeDefinition) {
        totalPoints += badge.badgeDefinition.points;
      }
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        totalPoints: totalPoints,
      },
    });
  } catch (error) {
    console.error(`An error occurred while updating total points for account ${accountId}:`, error);
    throw error;
  }
}

export async function checkBadges(commits: Commit[], accountId: string) {
  try {
    await checkCommitCountBadges(commits, accountId);
  } catch (error) {
    console.error(`An error occurred while checking badges for account ${accountId}:`, error);
    throw error;
  }
}

export async function getBadgesFromDB(accountId: string) {
  try {
    const badges = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        badges: {
          include: { badgeDefinition: true }, // Include the associated BadgeDefinition for each BadgeAward
        },
      },
    });
    return badges;
  } catch (error) {
    console.error(`An error occurred while getting badges for account ${accountId} from the database:`, error);
    throw error;
  }
}
