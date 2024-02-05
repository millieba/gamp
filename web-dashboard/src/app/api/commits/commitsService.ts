import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";

export async function fetchCommitCount(accountId: string) {
    try {
        const loggedInAccount = await getLoggedInAccount(accountId);
        const octokit = new Octokit({
            auth: `token ${loggedInAccount?.access_token}`,
        });
        const { data: user } = await octokit.users.getAuthenticated();
        const username = user.login;

        const commits = await octokit.request("GET /search/commits", {
            q: `author:${username}`,
        });
        const commitCount = commits.data.total_count;

        return { commitCount: commitCount };
    } catch (error) {
        console.error("An error occurred while counting all commits:", error);
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
        let allCommits = [];
        let page = 1;

        while (hasNextPage) {
            const commits = await octokit.request("GET /search/commits", {
                q: `author:${username}`,
                per_page: 100, // Get 100 results per page
                page: page,
            });

            for (let i = 0; i < commits.data.items.length; i++) {
                const commit = commits.data.items[i];
                allCommits.push({
                    committer: {
                        date: commit.commit.committer?.date,
                        email: commit.commit.committer?.email,
                        name: commit.commit.committer?.name,
                    },
                    repositoryName: commit.repository.name,
                    repositoryOwner: commit.repository.owner.login,
                    date: commit.commit.author.date,
                    message: commit.commit.message,
                });
            }

            // Check if there are more pages
            hasNextPage = commits.headers.link?.includes('rel="next"') || false;
            page++;
        }

        return { commits: allCommits };
    } catch (error) {
        console.error("An error occurred while getting all commits:", error);
        throw error;
    }
}

export async function getCommitCountFromDB(accountId: string) {
    try {
        const commitCount = await prisma.gitHubStats.findUnique({
            where: { accountId: accountId },
            select: { commitCount: true },
        });
        return commitCount;
    } catch (error) {
        console.error("An error occurred while fetching commit count from database:", error);
        throw error;
    }
}