import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getCommitsCount } from "../commits/commitsService";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

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

async function checkBadges(accountId: string) {
    await checkCommitsCountBadges(accountId);

    const badges = await prisma.account.findUnique({
        where: { id: accountId, provider: "github" },
        select: { badges: true },
    });

    return badges;
}

export const GET = async () => {
    try {
        const session = await getServerSession(options)

        if (!session || !session.user.githubAccountId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const badges = await checkBadges(session?.user?.githubAccountId);

        return NextResponse.json(badges, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};