import prisma from "@/utils/prisma";
import { fetchCommitCount } from "../commits/commitsService";

async function checkCommitCountBadges(accountId: string) {
    try {
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
    } catch (error) {
        console.error(`An error occurred while checking commit count badges for account ${accountId}:`, error);
        throw error;
    }
}

export async function checkBadges(accountId: string) {
    try {
        await checkCommitCountBadges(accountId);
    } catch (error) {
        console.error(`An error occurred while checking badges for account ${accountId}:`, error);
        throw error;
    }
}

export async function getBadgesFromDB(accountId: string) {
    try {
        const badges = await prisma.account.findUnique({ // Get badges from database
            where: { id: accountId },
            select: { badges: true },
        });
        return badges;
    } catch (error) {
        console.error(`An error occurred while getting badges for account ${accountId} from the database:`, error);
        throw error;
    }
}
