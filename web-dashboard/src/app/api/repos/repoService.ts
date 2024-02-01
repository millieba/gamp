import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";
import { Octokit } from "@octokit/rest";

export async function fetchRepoCount(accountId: string) {
    const loggedInAccount = await getLoggedInAccount(accountId);

    const octokit = new Octokit({
        auth: `token ${loggedInAccount?.access_token}`,
    });

    try {
        const repos = await octokit.request("GET /user/repos", {
            owner: loggedInAccount?.providerAccountId,
        });
        const repoCount = repos.data.length;
        return { repoCount };
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

    try {
        const repos = await octokit.request("GET /user/repos", {
            owner: loggedInAccount?.providerAccountId,
        });

        const repoData = repos.data.map((repo) => {
            return {
                name: repo.name,
                owner: repo.owner.login,
                description: repo.description,
            };
        });
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