import prisma from "@/utils/prisma";
import { checkBadges } from "../badges/checkBadgesService";
import { syncStats } from "../stats/statsSyncService";
import { Commit, Modification, prepareCommitsForDB } from "../commits/commitsService";
import { fetchIssueVariables } from "../issues/issuesService";
import { calculateLanguageSizes } from "../languages/languagesService";
import { fetchPullRequestVariables } from "../pullrequests/pullrequestsService";
import { fetchRepoCount } from "../repos/repoService";
import { ProgrammingLanguage } from "@/contexts/SyncContext";
import { checkLevel } from "../level/levelService";
import { PRData } from "../pullrequests/pullrequestsUtils";
import { AssignedIssueInterface, IssueQueryResultEdges } from "../issues/issuesUtils";
import { getTodaysQuote } from "../quote/quoteService";

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
  nightlyCommits: Commit[];
  morningCommits: Commit[];
  pullRequests: PRData[];
  issues: IssueQueryResultEdges[];
  assignedIssues: AssignedIssueInterface[];
  dailyModifications: Modification[];
}

export interface DBStats {
  commitCount: number;
  nightCommitCount: number;
  morningCommitCount: number;
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

  const languagesArray: { name: string; bytesWritten: number; firstUsedAt: string | Date }[] = [];

  for (let languageName in languages) {
    languagesArray.push({
      name: languages[languageName].language,
      bytesWritten: languages[languageName].size,
      firstUsedAt: languages[languageName].firstUsedAt,
    });
  }

  return {
    data: {
      // Data that can be inserted directly to database
      commitCount: commitData?.commitCount,
      nightCommitCount: commitData?.nightlyCommits.length,
      morningCommitCount: commitData?.morningCommits.length,
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
    nightlyCommits: commitData?.nightlyCommits,
    morningCommits: commitData?.morningCommits,
    pullRequests: prVariables?.pullRequests,
    issues: issueVariables?.data,
    dailyModifications: commitData?.dailyModifications,
    assignedIssues: issueVariables?.openAssignedIssueNode,
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
    await Promise.all([
      // Use Promise.all for independent tasks that can run concurrently
      getTodaysQuote(accountId),
      checkBadges(
        data.commits,
        data.nightlyCommits,
        data.morningCommits,
        data.pullRequests,
        data.issues,
        accountId,
        data.programmingLanguages
      ),
      syncStats(data.data, data.programmingLanguages, data.dailyModifications, data.assignedIssues, accountId),
    ]);

    await checkLevel(accountId); // Check level after badges are checked (total score depends on how many badges a user has)

    await prisma.account.update({ where: { id: accountId }, data: { lastSync: new Date() } }); // Update last sync timestamp
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
