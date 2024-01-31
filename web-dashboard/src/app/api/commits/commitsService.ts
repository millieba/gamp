import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";

export async function fetchCommitCount(accountId: string) {
    const loggedInAccount = await getLoggedInAccount(accountId);

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

        return { commitCount: totalCommits };
    } catch (error) {
        console.error("An error occurred while counting commits:", error);
        throw error;
    }
}

export async function fetchAllCommits(accountId: string) {
    try {
        const loggedInAccount = await getLoggedInAccount(accountId);

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

        return { commits: allCommits };
    } catch (error) {
        console.error("An error occurred while getting all commits:", error);
        throw error;
    }
}

export async function getCommitCountFromDB(accountId: string) {
    const commitCount = await prisma.gitHubStats.findUnique({
        where: { accountId: accountId },
        select: { commitCount: true },
    });

    return commitCount;
}