import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";
import { Octokit } from "@octokit/rest";

export async function fetchRepoCount(accountId: string) {
    try {
        const repos = await fetchRepos(accountId);
        return { repoCount: repos.repos.length };
    }
    catch (error) {
        console.error("An error occurred while counting repos:", error);
        throw error;
    }
};

export async function fetchRepos(accountId: string) {
    const loggedInAccount = await getLoggedInAccount(accountId);

    const octokit = new Octokit({
        auth: `token ${loggedInAccount?.access_token}`,
    });
    
    let hasNextPage = true;
    let repoData = [];
    let page = 1;

    try {
        while (hasNextPage) {
            const repos = await octokit.request("GET /user/repos", {
                owner: loggedInAccount?.providerAccountId,
                per_page: 100, // Fetch 100 repos per page
                page: page, // Fetch the specified page
            });

            for (let i = 0; i < repos.data.length; i++) {
                const repo = repos.data[i];
                repoData.push({
                    name: repo.name,
                    owner: repo.owner.login,
                    description: repo.description,
                });
            }

            // Check if there are more pages
            hasNextPage = repos.headers.link?.includes('rel="next"') || false;
            page++;
        }

        return { repos: repoData };

    } catch (error) {
        console.error("An error occurred while fetching all repos:", error);
        throw error;
    }
}

export async function getRepoCountFromDB(accountId: string) {
    try {
        const repoCount = await prisma.gitHubStats.findUnique({
            where: { accountId: accountId },
            select: { repoCount: true },
        });
        return repoCount;
    } catch (error) {
        console.error("An error occurred while fetching repo count from database:", error);
        throw error;
    }
}