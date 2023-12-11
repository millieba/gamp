import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

// NOTE: This will only work if the user has installed the GitHub app (i.e. not only signed in with GitHub)
// See https://github.com/orgs/community/discussions/48102 for details
export const GET = async () => {
    try {
        const session = await getServerSession(options);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const loggedInAccount = await prisma.account.findFirst({
            where: { userId: session?.user?.userId, provider: "github" },
        });

        console.log(loggedInAccount?.access_token)
        const octokit = new Octokit({
            auth: loggedInAccount?.access_token,
        });

        // Get GitHub username
        const { data: user } = await octokit.users.getAuthenticated();
        const username = user.login;

        let hasNextPage = true;
        let allCommits: any[] = []; // TODO: Type this
        let page = 1;

        while (hasNextPage) {
            const commits = await octokit.request("GET /search/commits", {
                q: `author:${username}`,
                per_page: 100, // Get 100 results per page
                page: page,
            });

            allCommits = [...allCommits, ...commits.data.items];

            // Check if there are more pages
            hasNextPage = commits.headers.link?.includes('rel="next"') || false;
            page++;
        }

        return NextResponse.json({ repos: allCommits }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
