import prisma from "@/utils/prisma";
import { Commit } from "../commits/commitsService";
import { PRQueryResponse } from "../pullrequests/pullrequestsUtils";

async function checkCommitCountBadges(commits: Commit[], accountId: string) {
  try {
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
  } catch (error) {
    console.error(`An error occurred while checking commit count badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkPrOpenedBadges(prs: PRQueryResponse[], accountId: string) {
  try {
    // Fetch all badges of type "commits_count" from the database
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "prs_opened_count" },
    });

    prs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const pullrequestsCount = prs.length;

    for (const badge of badges) {
      if (pullrequestsCount >= badge.threshold) {
        const thresholdIndex = pullrequestsCount - badge.threshold;
        const dateEarned = prs[thresholdIndex]?.createdAt || new Date();

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
    console.error(`An error occurred while checking opened PR badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkPrMergedBadges(prs: PRQueryResponse[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "prs_merged_count" },
    });

    let mergedPrs = [];

    // Adding merged PRs to the mergedPrs array
    for (const pr of prs) {
      if (pr.merged) {
        mergedPrs.push(pr);
      }
    }

    mergedPrs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const mergedPrsCount = mergedPrs.length; // The number of merged PRs

    for (const badge of badges) {
      if (mergedPrsCount >= badge.threshold) {
        const thresholdIndex = mergedPrsCount - badge.threshold;
        const dateEarned = mergedPrs[thresholdIndex]?.mergedAt || new Date();

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
    console.error(`An error occurred while checking merged PR badges for account ${accountId}:`, error);
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

export async function checkBadges(commits: Commit[], prs: PRQueryResponse[], accountId: string) {
  try {
    await prisma.badgeAward.deleteMany({
      where: { accountId },
    });
    await Promise.all([
      await checkCommitCountBadges(commits, accountId),
      await checkPrOpenedBadges(prs, accountId),
      await checkPrMergedBadges(prs, accountId),
    ]);
    await updateTotalPoints(accountId); // Update totalPoints after checking badges
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
