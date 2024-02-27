import prisma from "@/utils/prisma";
import { Commit } from "../commits/commitsService";

async function checkCommitCountBadges(commits: Commit[], accountId: string) {
  try {
    const commitCount = commits.length;

    // Fetch all badges of type "commits_count" from the database
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "commits_count" },
    });

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
  } catch (error) {
    console.error(`An error occurred while checking commit count badges for account ${accountId}:`, error);
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
