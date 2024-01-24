import prisma from "@/utils/prisma";
import { getCommitsCount } from "../commits/commitsService";

async function checkCommitsCountBadges(accountId: string) {
    const res = await (await getCommitsCount()).json();
    const commitsCount = res.totalCommits;

    // Fetch all badges of type "commits_count" from the database
    const badges = await prisma.badge.findMany({
        where: { type: "commits_count" },
    });

    for (const badge of badges) {
        if (commitsCount >= badge.threshold) {
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
    await checkCommitsCountBadges(accountId);

    const badges = await prisma.account.findUnique({
        where: { id: accountId, provider: "github" },
        select: { badges: true },
    });

    return badges;
}