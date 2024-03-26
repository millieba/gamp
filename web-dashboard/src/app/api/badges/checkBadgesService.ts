import prisma from "@/utils/prisma";
import { Commit } from "../commits/commitsService";
import { PRData } from "../pullrequests/pullrequestsUtils";
import { IssueQueryResultEdges } from "../issues/issuesUtils";
import {
  getCommitDatesSet,
  getHistoricalStrictStreak,
  getHistoricalWorkdayStreak,
} from "../commits/streak/streakService";
import { ProgrammingLanguage } from "@/contexts/SyncContext";

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

async function checkPrOpenedBadges(prs: PRData[], accountId: string) {
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

async function checkPrMergedBadges(prs: PRData[], accountId: string) {
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

async function checkOpenedIssuesAssigned(issues: IssueQueryResultEdges[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "issues_opened_count" },
    });

    // Flatten the edges arrays into a single array
    const allEdges = issues.flatMap((issue) => issue.edges);

    const openedAssignedIssues = allEdges.length; // Opened issues assigned to the user

    allEdges.sort((a, b) => new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime());

    for (const badge of badges) {
      if (openedAssignedIssues >= badge.threshold) {
        const thresholdIndex = openedAssignedIssues - badge.threshold;
        const dateEarned = allEdges[thresholdIndex].node.createdAt || new Date();

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
    console.error(`An error occurred while checking assigned opened issues badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkClosedIssuesAssigned(issues: IssueQueryResultEdges[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "issues_closed_count" },
    });

    // Flatten the edges arrays into a single array
    const allEdges = issues.flatMap((issue) => issue.edges);

    let closedIssuesAssigned = allEdges.filter((edge) => edge.node.state === "CLOSED");

    closedIssuesAssigned.sort(
      (a, b) => new Date(b.node.closedAt || 0).getTime() - new Date(a.node.closedAt || 0).getTime()
    );

    const closedAssignedIssuesCount = closedIssuesAssigned.length; // Closed issues assigned to the user

    for (const badge of badges) {
      if (closedAssignedIssuesCount >= badge.threshold) {
        const thresholdIndex = closedAssignedIssuesCount - badge.threshold;
        const dateEarned = closedIssuesAssigned[thresholdIndex].node.closedAt || new Date();

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
    console.error(`An error occurred while checking assigned closed issues badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkWorkdayStreakBadges(commitDates: Set<string>, accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "workday_streak" },
    });

    for (const badge of badges) {
      const historicalWorkdayStreak = getHistoricalWorkdayStreak(commitDates, badge.threshold);
      const streakLength = historicalWorkdayStreak.streakLength;
      const streakDates = historicalWorkdayStreak.streakDates;

      if (streakLength >= badge.threshold) {
        // streakDates are sorted from new to old, so the first date is the last date of the streak (the date the streak was high enough to earn the badge)
        const dateEarned = new Date(streakDates[0]);

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
    console.error(`An error occurred while checking workday streak badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkStrictStreakBadges(commitDates: Set<string>, accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "strict_streak" },
    });

    for (const badge of badges) {
      const historicalStrictStreak = getHistoricalStrictStreak(commitDates, badge.threshold);
      const streakLength = historicalStrictStreak.streakLength;
      const streakDates = historicalStrictStreak.streakDates;

      if (streakLength >= badge.threshold) {
        // streakDates are sorted from new to old, so the first date is the last date of the streak (the date the streak was high enough to earn the badge)
        const dateEarned = new Date(streakDates[0]);

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
    console.error(`An error occurred while checking strict streak badges for account ${accountId}:`, error);
    throw error;
  }
}

async function checkMiscNight(nightlyCommits: Commit[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "miscellaneous_nighttime" },
    });

    nightlyCommits.sort((a, b) => new Date(a.committedDate).getTime() - new Date(b.committedDate).getTime());

    for (const badge of badges) {
      if (nightlyCommits.length >= badge.threshold) {
        const dateEarned = nightlyCommits[badge.threshold === 0 ? 0 : badge.threshold - 1].committedDate;

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
    console.error(
      `An error occurred while checking assigned miscellaneous night badges for account ${accountId}:`,
      error
    );
    throw error;
  }
}

async function checkMiscMorning(morningCommits: Commit[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "miscellaneous_morningtime" },
    });

    morningCommits.sort((a, b) => new Date(a.committedDate).getTime() - new Date(b.committedDate).getTime());

    for (const badge of badges) {
      if (morningCommits.length >= badge.threshold) {
        const dateEarned = morningCommits[badge.threshold === 0 ? 0 : badge.threshold - 1].committedDate;

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
    console.error(
      `An error occurred while checking assigned miscellaneous morning badges for account ${accountId}:`,
      error
    );
    throw error;
  }
}

async function checkLanguages(languages: ProgrammingLanguage[], accountId: string) {
  try {
    const badges = await prisma.badgeDefinition.findMany({
      where: { type: "languages_count" },
    });

    const languagesCount = languages.length;

    for (const badge of badges) {
      if (languagesCount >= badge.threshold) {
        const dateEarned = languages[badge.threshold - 1].firstUsedAt;

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
    console.error(`An error occurred while checking language badges for account ${accountId}:`, error);
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

export async function checkBadges(
  commits: Commit[],
  nightlyCommits: Commit[],
  morningCommits: Commit[],
  prs: PRData[],
  issues: IssueQueryResultEdges[],
  accountId: string,
  languages: ProgrammingLanguage[]
) {
  try {
    await prisma.badgeAward.deleteMany({
      where: { accountId },
    });
    const commitDates = getCommitDatesSet(commits);
    await Promise.all([
      await checkCommitCountBadges(commits, accountId),
      await checkMiscNight(nightlyCommits, accountId),
      await checkMiscMorning(morningCommits, accountId),
      await checkPrOpenedBadges(prs, accountId),
      await checkPrMergedBadges(prs, accountId),
      await checkOpenedIssuesAssigned(issues, accountId),
      await checkClosedIssuesAssigned(issues, accountId),
      await checkWorkdayStreakBadges(commitDates, accountId),
      await checkStrictStreakBadges(commitDates, accountId),
      await checkLanguages(languages, accountId),
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
