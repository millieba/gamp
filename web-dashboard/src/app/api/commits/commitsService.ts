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



interface User {
    login: string;
    id: string;
}

interface Author {
    user: User;
    email: string;
    name: string;
}

interface PageInfo {
    hasNextPage: boolean;
    endCursor: string;
}

interface Node {
    deletions: number;
    additions: number;
    author: Author;
    message: string;
    changedFilesIfAvailable: number;
    committedDate: string;
}

interface History {
    nodes: Node[];
    pageInfo: PageInfo;
    totalCount: number;
}

interface Target {
    history: History;
}

interface DefaultBranchRef {
    target: Target;
}

interface Repo {
    nameWithOwner: string;
    defaultBranchRef: DefaultBranchRef;
}

interface Repositories {
    nodes: Repo[];
    pageInfo: PageInfo;
}

interface Organization {
    repositories: Repositories;
}

interface Viewer {
    organizations: {
        pageInfo: PageInfo;
        nodes: Organization[];
    };
    repositories: Repositories;
}

interface GraphQLResponse {
    viewer: Viewer;
}

export async function getAllCommitsWithGraphQL2(accountId: string) {
    try {
        const loggedInAccount = await getLoggedInAccount(accountId);
        let commits: any[] = [];
        let hasNextPage = true;
        let orgsCursor = null;
        let orgReposCursor = null;
        let viewerReposCursor = null;
        let orgCommitsCursor = null;
        let viewerCommitsCursor = null;
        let allResults = [];

        const graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ${loggedInAccount?.access_token}`,
            },
        });

        while (hasNextPage) {
            const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(`
            query getAllReposAndCommits($orgsCursor: String, $orgReposCursor: String, $viewerReposCursor: String, $orgCommitsCursor: String, $viewerCommitsCursor: String) {
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
                                history(first: 100, after: $orgCommitsCursor, author: {emails: "millieba@hotmail.com"}) {
                                  nodes {
                                    deletions
                                    additions
                                    author {
                                      user {
                                        login
                                        id
                                      }
                                      email
                                      name
                                    }
                                    message
                                    changedFilesIfAvailable
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
                            history(first: 100, after: $viewerCommitsCursor, author: {emails: "millieba@hotmail.com"}) {
                              nodes {
                                deletions
                                additions
                                author {
                                  user {
                                    login
                                    id
                                  }
                                  email
                                  name
                                }
                                message
                                changedFilesIfAvailable
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
                orgsCursor: orgsCursor,
                orgReposCursor: orgReposCursor,
                viewerReposCursor: viewerReposCursor,
                orgCommitsCursor: orgCommitsCursor,
                viewerCommitsCursor: viewerCommitsCursor
            });
            allResults.push(result);

            const viewer = result.viewer;
            const orgs = viewer.organizations.nodes;
            const viewerRepos = viewer.repositories.nodes;
            const orgRepos = viewer.organizations.nodes.map((org: Organization) => org.repositories.nodes.map((repo: Repo) => repo)).flat();

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
            console.log(hasNextPage);
        }

        return allResults;
    } catch (error) {
        console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
        throw error;
    }
}