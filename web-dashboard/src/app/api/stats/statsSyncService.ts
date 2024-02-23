import prisma from "@/utils/prisma";
import { fetchCommitCount, prepareCommitsForDB } from "../commits/commitsService";
import { fetchRepoCount } from "../repos/repoService";
import { calculateLanguageSizes } from "../languages/languagesService";
import { fetchIssueVariables } from "../issues/issuesService";
import { fetchPullRequestVariables } from "../pullrequests/pullrequestsService";

export async function syncStats(accountId: string) {
  try {
    const commitCount = await fetchCommitCount(accountId);
    const repoCount = await fetchRepoCount(accountId);
    const issueVariables = await fetchIssueVariables(accountId);
    const prVariables = await fetchPullRequestVariables(accountId);

    const languages = await calculateLanguageSizes(accountId);
    const languagesArray = Object.keys(languages).map((languageName) => {
      // Convert the object into an array of language objects as expected by Prisma
      return { name: languageName, bytesWritten: languages[languageName] };
    });
    const streaks = await prepareCommitsForDB(accountId);

    await prisma.gitHubStats.upsert({
      where: { accountId: accountId },
      update: {
        commitCount: commitCount?.commitCount,
        repoCount: repoCount?.repoCount,
        issueCount: issueVariables?.issueCount,
        avgTimeToCloseIssues: issueVariables?.avgTimeToCloseIssues,
        closedIssueCount: issueVariables?.closedIssueCount,
        createdPrs: prVariables?.createdPrs,
        createdAndMergedPrs: prVariables?.createdAndMergedPrs,
        strictStreak: streaks.streak.strictStreak,
        strictStreakToContinue: streaks.streak.strictStreakToContinue,
        workdayStreak: streaks.streak.workdayStreak,
        workdayStreakToContinue: streaks.streak.workdayStreakToContinue,
        programmingLanguages: {
          deleteMany: {}, // Delete all existing languages, then re-create them
          create: languagesArray,
        },
      },
      create: {
        accountId: accountId,
        repoCount: repoCount?.repoCount,
        commitCount: commitCount?.commitCount,
        issueCount: issueVariables?.issueCount,
        avgTimeToCloseIssues: issueVariables?.avgTimeToCloseIssues,
        closedIssueCount: issueVariables?.closedIssueCount,
        createdPrs: prVariables?.createdPrs,
        createdAndMergedPrs: prVariables?.createdAndMergedPrs,
        strictStreak: streaks.streak.strictStreak,
        strictStreakToContinue: streaks.streak.strictStreakToContinue,
        workdayStreak: streaks.streak.workdayStreak,
        workdayStreakToContinue: streaks.streak.workdayStreakToContinue,
        programmingLanguages: {
          create: languagesArray,
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
