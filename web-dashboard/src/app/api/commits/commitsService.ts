import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";
import { graphql } from "@octokit/graphql";
import { fetchRepos } from "../repos/repoService";

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

interface PageInfo {
    hasNextPage: boolean;
    endCursor: string;
}

interface Commit {
    message: string;
    oid: string;
    additions: number;
    deletions: number;
    changedFilesIfAvailable: number;
    author: {
        email: string;
    };
    committedDate: string;
}

interface Repo {
    nameWithOwner: string;
    defaultBranchRef: {
        target: {
            history: {
                nodes: Commit[];
                pageInfo: PageInfo;
                totalCount: number;
            };
        };

    };
}

interface Organization {
    repositories: {
        pageInfo: PageInfo;
        nodes: Repo[];
    }
}

interface GraphQLResponse {
    viewer: {
        organizations: {
            pageInfo: PageInfo;
            nodes: Organization[];
        };
        repositories: {
            pageInfo: PageInfo;
            nodes: Repo[];
        };
    };
}

export async function getAllCommitsWithGraphQL2(accountId: string) {
    try {
        const loggedInAccount = await getLoggedInAccount(accountId);
        let allCommits: any[] = [];
        let hasNextPage = true;
        let orgsCursor = null;
        let orgReposCursor = null;
        let viewerReposCursor = null;
        let orgCommitsCursor = null;
        let viewerCommitsCursor = null;

        const graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ${loggedInAccount?.access_token}`,
            },
        });

        const userId = (await graphqlWithAuth<{ viewer: { id: string } }>(`
            query {
                viewer {
                    id
                }
            }
        `)).viewer.id;

        while (hasNextPage) {
            const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(`
                query getAllReposAndCommits(
                    $userId: ID, 
                    $orgsCursor: String, 
                    $orgReposCursor: String, 
                    $viewerReposCursor: String, 
                    $orgCommitsCursor: String, 
                    $viewerCommitsCursor: String
                ) {
                    viewer {
                        organizations(first: 50, after: $orgsCursor) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            nodes {
                                repositories(first: 50, after: $orgReposCursor) {
                                    pageInfo {
                                        hasNextPage
                                        endCursor
                                    }
                                    nodes {
                                        nameWithOwner
                                        defaultBranchRef {
                                            target {
                                                ... on Commit {
                                                    history(first: 100, after: $orgCommitsCursor, author: {id: $userId}) {
                                                        nodes {
                                                            message
                                                            oid
                                                            additions
                                                            deletions
                                                            changedFilesIfAvailable
                                                            author {
                                                                email
                                                            }
                                                            committedDate
                                                        }
                                                        pageInfo {
                                                            hasNextPage
                                                            endCursor
                                                        }
                                                        totalCount
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        repositories(first: 50, after: $viewerReposCursor) {
                            pageInfo {
                                hasNextPage
                                endCursor
                            }
                            nodes {
                                nameWithOwner
                                defaultBranchRef {
                                    target {
                                        ... on Commit {
                                            history(first: 100, after: $viewerCommitsCursor, author: {id: $userId}) {
                                                nodes {
                                                    message
                                                    oid
                                                    additions
                                                    deletions
                                                    changedFilesIfAvailable
                                                    author {
                                                        email
                                                    }
                                                    committedDate
                                                }
                                                pageInfo {
                                                    hasNextPage
                                                    endCursor
                                                }
                                                totalCount
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `, {
                userId: userId,
                orgsCursor: orgsCursor,
                orgReposCursor: orgReposCursor,
                viewerReposCursor: viewerReposCursor,
                orgCommitsCursor: orgCommitsCursor,
                viewerCommitsCursor: viewerCommitsCursor
            });

            const viewer = result.viewer;
            const orgs = viewer.organizations.nodes;
            const viewerRepos = viewer.repositories.nodes;
            const orgRepos = orgs.flatMap((org: Organization) => org.repositories.nodes.map((repo: Repo) => repo));

            orgsCursor = viewer.organizations.pageInfo.endCursor;
            orgs.forEach((org: Organization) => {
                orgReposCursor = org.repositories.pageInfo.endCursor;
            });
            orgRepos.forEach((repo: Repo) => {
                orgCommitsCursor = repo.defaultBranchRef?.target?.history?.pageInfo?.endCursor;
            });
            viewerReposCursor = viewer.repositories.pageInfo.endCursor;
            viewerRepos.forEach((repo: Repo) => {
                viewerCommitsCursor = repo.defaultBranchRef?.target?.history?.pageInfo?.endCursor;
            });

            hasNextPage = orgs.some((org: Organization) => org.repositories.pageInfo.hasNextPage) || viewer.repositories.pageInfo.hasNextPage;

            const orgCommits = orgRepos.map((repo: Repo) => repo.defaultBranchRef?.target?.history?.nodes.map((commit: Commit) => (commit))).flat();
            const viewerCommits = viewerRepos.map((repo: Repo) => repo.defaultBranchRef?.target?.history?.nodes.map((commit: Commit) => (commit))).flat();

            allCommits.push(...viewerCommits, ...orgCommits);

            allCommits.sort((a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime()); // Sort commits by date

            const uniqueCommits = allCommits.filter((commit, index, self) => { // Remove duplicate commits
                if (commit && commit.oid) {
                    return index === self.findIndex((c) => (
                        c.oid === commit.oid
                    ));
                } else {
                    return true; // Do nothing to objects without an oid
                }
            });

            return uniqueCommits;
        }

        return allCommits;
    } catch (error) {
        console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
        throw error;
    }
}
