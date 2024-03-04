import prisma from "@/utils/prisma";
import { checkBadges } from "../badges/checkBadgesService";
import { syncStats } from "../stats/statsSyncService";
import { Commit, Modification, prepareCommitsForDB } from "../commits/commitsService";
import { fetchIssueVariables } from "../issues/issuesService";
import { calculateLanguageSizes } from "../languages/languagesService";
import { fetchPullRequestVariables } from "../pullrequests/pullrequestsService";
import { fetchRepoCount } from "../repos/repoService";
import { ProgrammingLanguage } from "@/contexts/SyncContext";
import { checkLevel } from "../levels/levelService";

export class TooManyRequestsError extends Error {
  retryAfter: number;
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = "TooManyRequestsError";
    this.retryAfter = retryAfter;
  }
}

export interface SyncData {
  data: DBStats;
  programmingLanguages: ProgrammingLanguage[];
  commits: Commit[];
  dailyModifications: Modification[];
}

export interface DBStats {
  commitCount: number;
  repoCount: number;
  issueCount: number;
  avgTimeToCloseIssues: number;
  closedIssueCount: number;
  createdPrs: number;
  createdAndMergedPrs: number;
  strictStreak: number | null;
  strictStreakToContinue: number | null;
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
}

async function fetchData(accountId: string): Promise<SyncData> {
  const [repoCount, issueVariables, prVariables, languages, commitData] = await Promise.all([
    fetchRepoCount(accountId),
    fetchIssueVariables(accountId),
    fetchPullRequestVariables(accountId),
    calculateLanguageSizes(accountId),
    prepareCommitsForDB(accountId),
  ]);

  const languagesArray = Object.keys(languages).map((languageName) => {
    // Convert the object into an array of language objects as expected by Prisma
    return { name: languageName, bytesWritten: languages[languageName] };
  });

  return {
    data: {
      // Data that can be inserted directly to database
      commitCount: commitData?.commitCount,
      repoCount: repoCount?.repoCount,
      issueCount: issueVariables?.issueCount,
      avgTimeToCloseIssues: issueVariables?.avgTimeToCloseIssues,
      closedIssueCount: issueVariables?.closedIssueCount,
      createdPrs: prVariables?.createdPrs,
      createdAndMergedPrs: prVariables?.createdAndMergedPrs,
      strictStreak: commitData?.streak?.strictStreak,
      strictStreakToContinue: commitData?.streak?.strictStreakToContinue,
      workdayStreak: commitData?.streak?.workdayStreak,
      workdayStreakToContinue: commitData?.streak?.workdayStreakToContinue,
    },
    programmingLanguages: languagesArray,
    commits: commitData?.commits,
    dailyModifications: commitData?.dailyModifications,
  };
}

export async function syncWithGithub(accountId: string) {
  try {
    const account = await prisma.account.findUnique({ where: { id: accountId } });

    if (!account) throw new Error(`Account with id ${accountId} not found`);

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (account.lastSync && account.lastSync > fiveMinutesAgo) {
      const retryAfter = (account.lastSync.getTime() + 5 * 60 * 1000 - Date.now()) / 1000;
      const timeSinceLastSync = (Date.now() - account.lastSync.getTime()) / 1000;
      throw new TooManyRequestsError(
        `Last sync was ${timeSinceLastSync.toFixed(0)} seconds ago. Please retry after ${retryAfter.toFixed(
          0
        )} seconds.`,
        retryAfter
      );
    }
    const data = await fetchData(accountId);

    await checkBadges(data.commits, accountId);
    await syncStats(data.data, data.programmingLanguages, data.dailyModifications, accountId);
    await checkLevel(accountId);

    await prisma.account.update({ where: { id: accountId }, data: { lastSync: new Date() } });
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      console.error("Throttling sync for account " + accountId + " for " + error.retryAfter + " seconds");
      throw error;
    } else {
      console.error(`An error occurred while syncing account ${accountId}:`, error);
      throw error;
    }
  }
}
