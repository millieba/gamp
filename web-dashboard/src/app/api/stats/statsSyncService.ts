import prisma from "@/utils/prisma";
import { DBStats } from "../sync/syncService";
import { ProgrammingLanguage } from "@/contexts/SyncContext";

export async function syncStats(statsData: DBStats, programmingLanguages: ProgrammingLanguage[], accountId: string) {
  try {
    await prisma.gitHubStats.upsert({
      where: { accountId: accountId },
      update: {
        ...statsData,
        programmingLanguages: {
          deleteMany: {}, // Delete all existing languages, then re-create them
          create: programmingLanguages,
        },
      },
      create: {
        accountId: accountId,
        ...statsData,
        programmingLanguages: {
          create: programmingLanguages,
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
