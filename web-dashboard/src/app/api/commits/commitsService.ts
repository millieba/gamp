import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";
import { graphql as graphql } from "@octokit/graphql";
import { graphql as graphQLType } from "@octokit/graphql/dist-types/types";

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
  name: string;
  owner: {
    login: string;
  };
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
  };
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

export interface SingleRepoCommitsResult {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          pageInfo: PageInfo;
          nodes: Commit[];
        };
      };
    };
  };
}

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

export async function setupGraphQLWithAuth(accountId: string) {
  const loggedInAccount = await getLoggedInAccount(accountId);
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${loggedInAccount?.access_token}`,
    },
  });

  const userId = (
    await graphqlWithAuth<{ viewer: { id: string } }>(
      `#graphql
        query {
            viewer {
                id
            }
        }
    `
    )
  ).viewer.id;

  return { graphqlWithAuth, userId };
}

export async function getAllCommitsBestCase(graphqlWithAuth: graphQLType, userId: string) {
  try {
    let bestCaseCommits: Commit[] = [];
    let fetchAloneRepos: { repoName: string; owner: string }[] = [];
    let hasNextPageRepos = true;

    let reposCursor = null;
    while (hasNextPageRepos) {
      const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(
        `#graphql
        query GetAllCommits(
            $userId: ID, 
            $reposCursor: String, 
        ) {
            viewer {
                repositories(first: 25, after: $reposCursor) {
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    nodes {
                        name
                        owner {
                            login
                        }
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history(first: 50, author: {id: $userId}) {
                                        pageInfo {
                                            hasNextPage
                                            endCursor
                                        }
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
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        `,
        {
          userId: userId,
          reposCursor: reposCursor,
        }
      );

      const reposData = result?.viewer?.repositories;
      if (reposData && reposData.nodes) {
        for (const repo of reposData.nodes) {
          const repoHistory = repo.defaultBranchRef?.target?.history;
          if (repoHistory && repoHistory.pageInfo.hasNextPage) {
            fetchAloneRepos.push({ repoName: repo.name, owner: repo.owner.login });
          } else if (repoHistory) {
            const repoCommits = repoHistory.nodes;
            bestCaseCommits.push(...repoCommits);
          }
        }

        const pageInfo = reposData.pageInfo;
        hasNextPageRepos = pageInfo?.hasNextPage ?? false;
        reposCursor = pageInfo?.endCursor ?? null;
      } else {
        hasNextPageRepos = false;
      }
    }

    return { bestCaseCommits, fetchAloneRepos };
  } catch (error) {
    console.error(`Failed to fetch best case commits for user ID ${userId}: ${error}`);
    throw error;
  }
}

export async function getSingleRepoCommits(
  userId: string,
  repoName: string,
  owner: string,
  commitsCursor: string | null,
  graphqlWithAuth: graphQLType
) {
  try {
    let repoCommits: Commit[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      const result: SingleRepoCommitsResult = await graphqlWithAuth<SingleRepoCommitsResult>(
        `#graphql
        query getCommitsInRepo(
          $userId: ID,
            $repoName: String!,
            $owner: String!,
            $commitsCursor: String
        ) {
            repository(name: $repoName, owner: $owner) {
                defaultBranchRef {
                    target {
                        ... on Commit {
                            history(first: 50, after: $commitsCursor, author: {id: $userId}) {
                                pageInfo {
                                    hasNextPage
                                    endCursor
                                }
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
                            }
                        }
                    }
                }
            }
        }
        `,
        {
          userId: userId,
          repoName: repoName,
          owner: owner,
          commitsCursor: commitsCursor,
        }
      );

      const commitsData = result?.repository?.defaultBranchRef?.target?.history;
      if (commitsData && commitsData.nodes) {
        repoCommits.push(...commitsData.nodes);
      }

      const pageInfo = commitsData?.pageInfo;
      hasNextPage = pageInfo?.hasNextPage ?? false;
      commitsCursor = pageInfo?.endCursor ?? null;
          }
    return repoCommits;
  } catch (error) {
    console.error(`Failed to fetch commits for repo ${repoName}: ${error}`);
    throw error;
  }
}

export async function fetchAllCommitsHandler(accountId: string) {
  try {
    const { graphqlWithAuth, userId } = await setupGraphQLWithAuth(accountId);

    const { bestCaseCommits, fetchAloneRepos } = await getAllCommitsBestCase(graphqlWithAuth, userId);

    let allCommits: Commit[] = [...bestCaseCommits];
    console.log(fetchAloneRepos);
    if (fetchAloneRepos.length > 0) {
      for (const { repoName, owner } of fetchAloneRepos) {
        const repoCommits = await getSingleRepoCommits(userId, repoName, owner, null, graphqlWithAuth);
        allCommits = [...allCommits, ...repoCommits];
      }
    }

    const uniqueCommits = sortAndRemoveDuplicates(allCommits);

    return uniqueCommits;
  } catch (error) {
    console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
    throw error;
  }
}

function sortAndRemoveDuplicates(commits: Commit[]) {
  commits.sort((a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime()); // Sort commits by date

  const uniqueCommits = commits.filter((commit, index, self) => {
    if (commit && commit.oid) {
      return index === self.findIndex((c) => c.oid === commit.oid); // Filter out commits with the same object id
    } else {
      return true; // Do nothing to objects without an oid
    }
  });

  return uniqueCommits;
}
