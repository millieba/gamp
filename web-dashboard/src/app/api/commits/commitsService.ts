import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getLoggedInAccount } from "@/utils/user";
import { graphql as graphql } from "@octokit/graphql";
import { graphql as graphQLType } from "@octokit/graphql/dist-types/types";

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

export async function getAllCommitsWithGraphQL2(accountId: string) {
  try {
    const loggedInAccount = await getLoggedInAccount(accountId);
    let allCommits: Commit[] = [];
    let hasNextPageViewerRepos = true;
    let hasNextPageViewerCommits = true;
    let viewerReposCursor = null;
    let viewerCommitsCursor: string | null = null;

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${loggedInAccount?.access_token}`,
      },
    });

    const userId = (
      await graphqlWithAuth<{ viewer: { id: string } }>(`
            query {
                viewer {
                    id
                }
            }
        `)
    ).viewer.id;

    let runCount = 0;

    while (hasNextPageViewerRepos || hasNextPageViewerCommits) {
      runCount++;
      const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(
        `#graphql
            query getAllViewerReposAndCommits(
                $userId: ID, 
                $viewerReposCursor: String, 
                $viewerCommitsCursor: String
            ) {
                viewer {
                    repositories(first: 10, after: $viewerReposCursor) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        nodes {
                            nameWithOwner
                            defaultBranchRef {
                                target {
                                    ... on Commit {
                                        history(first: 10, after: $viewerCommitsCursor, author: {id: $userId}) {
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
          viewerReposCursor: viewerReposCursor,
          viewerCommitsCursor: hasNextPageViewerCommits ? viewerCommitsCursor : null,
        }
      );
      console.log("\n@@@ Run number ", runCount, " in progress...");
      console.log("@@@ Starting with repo cursor: ", viewerReposCursor);
      console.log("@@@ Starting with commits cursor: ", viewerCommitsCursor);
      console.log("@@@ Has next page viewer repos: ", hasNextPageViewerRepos);
      console.log("@@@ Has next page viewer commits: ", hasNextPageViewerCommits);

      const viewer = result.viewer;
      const viewerRepos = viewer.repositories.nodes;

      hasNextPageViewerRepos = viewer.repositories.pageInfo?.hasNextPage;

      if (viewerReposCursor === null || hasNextPageViewerCommits === false) {
        console.log("ooooooooooooooooooo", hasNextPageViewerCommits);
        // Makes sure we only update the cursor if it's the first run or if we're done with the commits for the current repo
        viewerReposCursor = viewer.repositories.pageInfo?.endCursor;
        console.log("########################## Updating viewer repos cursor to: ", viewerReposCursor);
      }

      const pageInfo = viewerRepos[viewerRepos.length - 1]?.defaultBranchRef?.target?.history?.pageInfo;
      const commits = viewerRepos.map((repo: Repo) => repo.defaultBranchRef?.target?.history?.nodes || []).flat();
      console.log(pageInfo);

      if (pageInfo) {
        hasNextPageViewerCommits = pageInfo.hasNextPage;
        viewerCommitsCursor = pageInfo.endCursor;
      } else {
        // No pageInfo available, stop the loop
        hasNextPageViewerCommits = false;
        viewerCommitsCursor = null;
      }
      allCommits.push(...commits);

      allCommits.sort((a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime()); // Sort commits by date
      console.log("------ Repo cursor after: ", viewerReposCursor);
      console.log("------ Commits cursor after: ", viewerCommitsCursor);
      console.log("------ Has next page viewer repos after: ", hasNextPageViewerRepos);
      console.log("------ Has next page viewer commits after: ", hasNextPageViewerCommits);
    }

    return allCommits;
  } catch (error) {
    console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
    throw error;
  }
}

export async function pseudoCode(accountId: string) {
  try {
    const loggedInAccount = await getLoggedInAccount(accountId);
    let commits: Commit[] = [];
    let hasNextPageViewerRepos = true;
    let hasNextPageViewerCommits = true;
    let viewerReposCursor = null;
    let viewerCommitsCursor: string | null = null;

    const graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${loggedInAccount?.access_token}`,
      },
    });

    const userId = (
      await graphqlWithAuth<{ viewer: { id: string } }>(`
                    query {
                        viewer {
                            id
                        }
                    }
                `)
    ).viewer.id;

    const getAllCommitsQuery = async (
      userId: string,
      viewerReposCursor: string | null,
      viewerCommitsCursor: string | null
    ) => {
      const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(
        `#graphql
                    query GetAllCommits(
                        $userId: ID, 
                        $viewerReposCursor: String, 
                        $viewerCommitsCursor: String
                    ) {
                        viewer {
                            repositories(first: 10, after: $viewerReposCursor) {
                                pageInfo {
                                    hasNextPage
                                    endCursor
                                }
                                nodes {
                                    nameWithOwner
                                    defaultBranchRef {
                                        target {
                                            ... on Commit {
                                                history(first: 1, after: $viewerCommitsCursor, author: {id: $userId}) {
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
          viewerReposCursor: viewerReposCursor,
          viewerCommitsCursor: viewerCommitsCursor,
        }
      );
      return result;
    };

    while (hasNextPageViewerRepos) {
      const result = await getAllCommitsQuery(userId, viewerReposCursor, viewerCommitsCursor);
      const viewerRepos = result?.viewer?.repositories?.nodes;

      hasNextPageViewerRepos = result?.viewer?.repositories?.pageInfo?.hasNextPage;
      viewerReposCursor = result?.viewer?.repositories?.pageInfo?.endCursor;

      for (let i = 0; i < viewerRepos.length; i++) {
        // Iterate through each repository
        const repo = viewerRepos[i];
        const repoCommits = repo?.defaultBranchRef?.target?.history?.nodes;
        commits.push(...repoCommits);

        // Check if there are more commits pages for this repository
        hasNextPageViewerCommits = repo?.defaultBranchRef?.target?.history?.pageInfo?.hasNextPage;
        viewerCommitsCursor = repo?.defaultBranchRef?.target?.history?.pageInfo?.endCursor;

        // Fetch remaining pages of commits for this repository
        while (hasNextPageViewerCommits) {
          console.log("Still going strong");
          console.log("@@@ Using viewerReposCursor:", viewerReposCursor);
          console.log("@@@ Using viewerCommitsCursor:", viewerCommitsCursor);
          // Usually fails here: "... does not appear to be a valid cursor."
          const commitsResult = await getAllCommitsQuery(userId, viewerReposCursor, viewerCommitsCursor);
          const moreCommits = commitsResult?.viewer?.repositories?.nodes[i]?.defaultBranchRef?.target?.history?.nodes;
          console.log(moreCommits);
          commits.push(...moreCommits);
          hasNextPageViewerCommits =
            commitsResult?.viewer?.repositories?.nodes[i]?.defaultBranchRef?.target?.history?.pageInfo?.hasNextPage;
          viewerCommitsCursor =
            commitsResult?.viewer?.repositories?.nodes[i]?.defaultBranchRef?.target?.history?.pageInfo?.endCursor;
        }
      }
    }

    console.log(commits.length);
    return commits;
  } catch (error) {
    console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
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
    await graphqlWithAuth<{ viewer: { id: string } }>(`
                    query {
                        viewer {
                            id
                        }
                    }
                `)
  ).viewer.id;

  return { graphqlWithAuth, userId };
}

export async function getAllCommitsBestCase(reposCursor: string | null, graphqlWithAuth: graphQLType, userId: string) {
  try {
    let bestCaseCommits: Commit[] = [];
    let fetchAloneRepos: { repoName: string; owner: string }[] = [];
    let hasNextPageRepos = true;

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
                                    history(first: 100, author: {id: $userId}) {
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

export async function getSingleRepoCommits(
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
            $repoName: String!,
            $owner: String!,
            $commitsCursor: String
        ) {
            repository(name: $repoName, owner: $owner) {
                defaultBranchRef {
                    target {
                        ... on Commit {
                            history(first: 100, after: $commitsCursor) {
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

    const { bestCaseCommits, fetchAloneRepos } = await getAllCommitsBestCase(null, graphqlWithAuth, userId);

    let allCommits: Commit[] = [...bestCaseCommits];
    console.log(fetchAloneRepos);
    if (fetchAloneRepos.length > 0) {
      for (const { repoName, owner } of fetchAloneRepos) {
        const repoCommits = await getSingleRepoCommits(repoName, owner, null, graphqlWithAuth);
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
