import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

export async function getAllCommits() {
    try {
        const session = await getServerSession(options);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const loggedInAccount = await prisma.account.findFirst({
            where: { userId: session?.user?.userId, provider: "github" },
        });

        const octokit = new Octokit({
            auth: `token ${loggedInAccount?.access_token}`,
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

        allCommits = allCommits.map((commit) => ({
            committer: {
                date: commit.commit.committer.date,
                email: commit.commit.committer.email,
                name: commit.commit.committer.name,
            },
            repositoryName: commit.repository.name,
            date: commit.commit.author.date,
            message: commit.commit.message,
        }));


        return NextResponse.json({ commits: allCommits }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function getCommitsCount() {
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
}