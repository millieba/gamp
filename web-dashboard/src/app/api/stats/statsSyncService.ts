import prisma from "@/utils/prisma";
import { fetchCommitCount, prepareCommitsForDB } from "../commits/commitsService";
import { fetchRepoCount } from "../repos/repoService";
import { calculateLanguageSizes } from "../languages/languagesService";
import { fetchIssueVariables } from "../issues/issuesService";
import { fetchPullRequestVariables } from "../pullrequests/pullrequestsService";

async function fetchData(accountId: string) {
  const [commitCount, repoCount, issueVariables, prVariables, languages, streaks] = await Promise.all([
    fetchCommitCount(accountId),
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

  const averageModificationsArray = streaks?.averageModifications?.map((modification) => {
    // Convert the object into an array of language objects as expected by Prisma
    return {
      date: modification.dateOfDay,
      additions: modification.additions,
      deletions: modification.deletions,
      totalCommits: modification.totalCommits,
    };
  });

  return {
    data: {
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
    },
    programmingLanguages: languagesArray,
    dailyModifications: averageModificationsArray,
  };
}

export async function syncStats(accountId: string) {
  try {
    const data = await fetchData(accountId);

    await prisma.gitHubStats.upsert({
      where: { accountId: accountId },
      update: {
        ...data.data,
        programmingLanguages: {
          deleteMany: {}, // Delete all existing languages, then re-create them
          create: data.programmingLanguages,
        },
        dailyModifications: {
          deleteMany: {}, // Delete all existing modifications, then re-create them
          create: data.dailyModifications,
        },
      },
      create: {
        accountId: accountId,
        ...data.data,
        programmingLanguages: {
          create: data.programmingLanguages,
        },
        dailyModifications: {
          create: data.dailyModifications,
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
        dailyModifications: {
          select: {
            date: true,
            additions: true,
            deletions: true,
            totalCommits: true,
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
