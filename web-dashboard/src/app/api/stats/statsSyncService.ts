import prisma from "@/utils/prisma";
import { DBStats } from "../sync/syncService";
import { ProgrammingLanguage } from "@/contexts/SyncContext";
import { Modification } from "../commits/commitsService";
import { AssignedIssueInterface } from "../issues/issuesUtils";

export async function syncStats(
  statsData: DBStats,
  programmingLanguages: ProgrammingLanguage[],
  dailyModifications: Modification[],
  assignedIssues: AssignedIssueInterface[],
  accountId: string
) {
  try {
    await prisma.gitHubStats.upsert({
      where: { accountId: accountId },
      update: {
        ...statsData,
        programmingLanguages: {
          deleteMany: {}, // Delete all existing languages, then re-create them
          create: programmingLanguages,
        },
        dailyModifications: {
          deleteMany: {}, // Delete all existing modifications, then re-create them
          create: dailyModifications,
        },
        assignedIssues: {
          deleteMany: {}, // Delete all existing assigned issues, then re-create them
          create: assignedIssues,
        },
      },
      create: {
        accountId: accountId,
        ...statsData,
        programmingLanguages: {
          create: programmingLanguages,
        },
        dailyModifications: {
          create: dailyModifications,
        },
        assignedIssues: {
          create: assignedIssues,
        },
      },
    });
  } catch (error) {
    console.error(`An error occurred while syncing stats for account ${accountId}:`, error);
    throw error; // re-throw the error so it can be caught and handled by the calling function
  }
}

export async function getStatsFromDB(accountId: string) {
  try {
    const stats = await prisma.gitHubStats.findUnique({
      where: { accountId: accountId },
      select: {
        commitCount: true,
        nightCommitCount: true,
        morningCommitCount: true,
        repoCount: true,
        issueCount: true,
        avgTimeToCloseIssues: true,
        closedIssueCount: true,
        createdPrs: true,
        createdAndMergedPrs: true,
        strictStreak: true,
        strictStreakToContinue: true,
        workdayStreak: true,
        workdayStreakToContinue: true,
        programmingLanguages: {
          select: {
            name: true,
            bytesWritten: true,
            firstUsedAt: true,
          },
        },
        dailyModifications: {
          select: {
            date: true,
            additions: true,
            deletions: true,
            totalCommits: true,
          },
        },
        assignedIssues: {
          select: {
            title: true,
            url: true,
            createdAt: true,
            closedAt: true,
            number: true,
            state: true,
          },
        },
      },
    });
    return { githubStats: stats };
  } catch (error) {
    console.error(`An error occurred while getting stats for account ${accountId} from the database:`, error);
    throw error;
  }
}
