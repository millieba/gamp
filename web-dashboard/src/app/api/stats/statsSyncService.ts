import prisma from "@/utils/prisma";
import { getCommitsCount } from "../commits/commitsService";

export async function syncStats(accountId: string) {
    try {
        const commitsCount = await (await getCommitsCount()).json();
        // const languages = await (await getLanguages()).json(); // TODO: This function doesn't exist yet. Currently directly inside the route handler.

        await prisma.gitHubStats.upsert({
            where: { accountId: accountId },
            update: {
                commitCount: commitsCount?.totalCommits, // TODO: It is very goofy to call this commitCount one place and commitsCount another. Fix plz.
                // languages: languages,
            },
            create: {
                accountId: accountId,
                commitCount: commitsCount?.totalCommits,
                // languages: languages,
            },
        });
    } catch (error) {
        console.error(`An error occurred while syncing stats for account ${accountId}:`, error);
        throw error; // re-throw the error so it can be caught and handled by the calling function
    }
}