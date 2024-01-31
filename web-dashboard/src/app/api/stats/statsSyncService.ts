import prisma from "@/utils/prisma";
import { getCommitsCount } from "../commits/commitsService";
import { calculateLanguageSizes } from "../languages/languagesService";

export async function syncStats(accountId: string) {
    try {
        const commitsCount = await (await getCommitsCount()).json();
        const languages = await calculateLanguageSizes(accountId);
        const languagesArray = Object.keys(languages).map((languageName) => { // Convert the object into an array of language objects as expected by Prisma
            return { name: languageName, bytesWritten: languages[languageName] };
          });

        await prisma.gitHubStats.upsert({
            where: { accountId: accountId },
            update: {
                commitCount: commitsCount?.totalCommits, // TODO: It is very goofy to call this commitCount one place and commitsCount another. Fix plz.
                programmingLanguages: {
                    deleteMany: {}, // Delete all existing languages, then re-create them
                    create: languagesArray,
                },
            },
            create: {
                accountId: accountId,
                commitCount: commitsCount?.totalCommits,
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