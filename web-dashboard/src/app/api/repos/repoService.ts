import prisma from "@/utils/prisma";
import { Octokit } from "@octokit/rest";

export async function fetchRepoCount(accountId: string) {
    const loggedInAccount = await prisma.account.findUnique({
        where: { id: accountId, provider: "github" },
    });

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
        console.log(error);
    }
};

export async function fetchRepos(accountId: string) {
    const loggedInAccount = await prisma.account.findUnique({
        where: { id: accountId, provider: "github" },
    });

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
        return {repos: repoData};

    } catch (error) {
        console.log(error);
    }
}