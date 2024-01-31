import prisma from "@/utils/prisma";
import { fetchCommitCount } from "../commits/commitsService";

async function checkCommitCountBadges(accountId: string) {
    // TODO: Consider calling getCommitCountFromDB() instead of fetchCommitCount() to avoid unnecessary API calls.
    // However, would have to make sure that stats are synced before checking badges.
    const commitCount = (await fetchCommitCount(accountId)).commitCount;

    // Fetch all badges of type "commits_count" from the database
    const badges = await prisma.badge.findMany({
        where: { type: "commits_count" },
    });

    for (const badge of badges) {
        if (commitCount >= badge.threshold) {
            // Assign the badge to the user by adding it to the user's account
            await prisma.account.update({
                where: { id: accountId },
                data: {
                    badges: {
                        connect: { id: badge.id },
                    },
                },
            });
        }
    }
}

export async function checkBadges(accountId: string) {
    await checkCommitCountBadges(accountId);
}