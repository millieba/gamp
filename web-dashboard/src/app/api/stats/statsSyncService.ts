import prisma from "@/utils/prisma";
import { fetchCommitCount } from "../commits/commitsService";
import { fetchRepoCount } from "../repos/repoService";
import { calculateLanguageSizes } from "../languages/languagesService";
import { issueCount } from "../issues/issuesService";

export async function syncStats(accountId: string) {
    try {
        const commitCount = await fetchCommitCount(accountId);
        const repoCount = await fetchRepoCount(accountId);
        const issueCountvariable = await issueCount(accountId);

        const languages = await calculateLanguageSizes(accountId);
        const languagesArray = Object.keys(languages).map((languageName) => { // Convert the object into an array of language objects as expected by Prisma
            return { name: languageName, bytesWritten: languages[languageName] };
        });

        await prisma.gitHubStats.upsert({
            where: { accountId: accountId },
            update: {
                commitCount: commitCount?.commitCount,
                repoCount: repoCount?.repoCount,
                issueCount: issueCountvariable[0],
                avgTimeToCloseIssues: issueCountvariable[1],
                closedIssueCount: issueCountvariable[2],
                programmingLanguages: {
                    deleteMany: {}, // Delete all existing languages, then re-create them
                    create: languagesArray,
                },
            },
            create: {
                accountId: accountId,
                repoCount: repoCount?.repoCount,
                commitCount: commitCount?.commitCount,
                issueCount: issueCountvariable[0],
                avgTimeToCloseIssues: issueCountvariable[1],
                closedIssueCount: issueCountvariable[2],
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