import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

export const GET = async () => {
    const session = await getServerSession(options)

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const loggedInAccount = await prisma.account.findFirst({
        where: { userId: session?.user?.userId, provider: "github" },
    });

    const octokit = new Octokit({
        auth: `token ${loggedInAccount?.access_token}`,
    });
    const { data: user } = await octokit.users.getAuthenticated();
    const username = user.login;


    try {
        let hasNextPage = true;
        let totalCommits = 0;
        let page = 1;

        while (hasNextPage) {
            const commits = await octokit.request("GET /search/commits", {
                q: `author:${username}`,
                per_page: 100, // Get 100 results per page
                page: page,
            });

            totalCommits += commits.data.items.length;

            // Check if there are more pages
            hasNextPage = commits.headers.link?.includes('rel="next"') || false;
            page++;
        }

        return NextResponse.json({ totalCommits: totalCommits }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
};