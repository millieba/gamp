import prisma from "@/utils/prisma";
import { fetchCommitCount } from "../commits/commitsService";
import { fetchRepoCount } from "../repos/repoService";
import { calculateLanguageSizes } from "../languages/languagesService";

export async function syncStats(accountId: string) {
    try {
        const commitCount = await fetchCommitCount(accountId);
        const repoCount = await fetchRepoCount(accountId);

        const languages = await calculateLanguageSizes(accountId);
        const languagesArray = Object.keys(languages).map((languageName) => { // Convert the object into an array of language objects as expected by Prisma
            return { name: languageName, bytesWritten: languages[languageName] };
        });

        await prisma.gitHubStats.upsert({
            where: { accountId: accountId },
            update: {
                commitCount: commitCount?.commitCount,
                repoCount: repoCount?.repoCount,
                programmingLanguages: {
                    deleteMany: {}, // Delete all existing languages, then re-create them
                    create: languagesArray,
                },
            },
            create: {
                accountId: accountId,
                repoCount: repoCount?.repoCount,
                commitCount: commitCount?.commitCount,
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