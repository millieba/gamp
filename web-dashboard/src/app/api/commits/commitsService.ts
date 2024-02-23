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

    let hasNextPageOrgs = true;
    let afterOrgsCursor = null;

    let afterOrgReposCursor = null;

    let hasNextPageViewerRepos = true;
    let afterViewerReposCursor = null;

    while (hasNextPageOrgs || hasNextPageViewerRepos) {
      const result: GraphQLResponse = await graphqlWithAuth<GraphQLResponse>(
        `#graphql
            query getBestCaseCommits($userId: ID, $afterOrgsCursor: String, $afterOrgReposCursor: String, $afterViewerReposCursor: String) {
                viewer {
                    organizations(first: 25, after: $afterOrgsCursor) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        nodes {
                            repositories(first: 25, after: $afterOrgReposCursor) {
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
                                                history(first: 100, author: {id: $userId}){
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
            repositories(first: 25, after: $afterViewerReposCursor) {
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
                                history(first: 100, author: {id: $userId}){
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
            }`,
        {
          userId: userId,
          afterOrgsCursor: afterOrgsCursor,
          afterOrgReposCursor: afterOrgReposCursor,
          afterViewerReposCursor: afterViewerReposCursor,
        }
      );

      hasNextPageOrgs = result.viewer.organizations.pageInfo.hasNextPage;
      afterOrgsCursor = result.viewer.organizations.pageInfo.endCursor;

      hasNextPageViewerRepos = result.viewer.repositories.pageInfo.hasNextPage;
      afterViewerReposCursor = result.viewer.repositories.pageInfo.endCursor;

      const processRepo = (repo: Repo) => {
        const repoHistory = repo.defaultBranchRef?.target?.history;
        if (!repoHistory) return;
        if (repoHistory.pageInfo.hasNextPage) {
          fetchAloneRepos.push({ repoName: repo.name, owner: repo.owner.login });
        } else {
          const repoCommits = repoHistory.nodes;
          bestCaseCommits.push(...repoCommits);
        }
      };

      result.viewer.repositories.nodes?.forEach((repo) => processRepo(repo));

      result.viewer.organizations.nodes.forEach((org) => {
        afterOrgReposCursor = org.repositories.pageInfo.endCursor;
        org.repositories.nodes.forEach((repo) => processRepo(repo));
      });
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
                            history(first: 100, after: $commitsCursor, author: {id: $userId}) {
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

function sortAndRemoveDuplicates(commits: Commit[]) {
  const uniqueCommits = commits.filter((commit, index, self) => {
    if (commit && commit.oid) {
      return index === self.findIndex((c) => c.oid === commit.oid); // Filter out commits with the same object id
    } else {
      return true; // Do nothing to objects without an oid
    }
  });
  uniqueCommits.sort((a, b) => new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime()); // Sort commits by date

  return uniqueCommits;
}

function generateMockCommits(startDate: Date, daysBack: number, skipDays: number[]): Commit[] {
  const mockCommits: Commit[] = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - i);

    // Check if the current day should be skipped
    if (skipDays.includes(date.getDay())) {
      continue; // Skip this day
    }

    const commit: Commit = {
      message: `Commit for ${date.toLocaleDateString("en-US", { weekday: "long" })}`,
      oid: i.toString(),
      additions: Math.floor(Math.random() * 200) + 50,
      deletions: Math.floor(Math.random() * 100) + 20,
      changedFilesIfAvailable: Math.floor(Math.random() * 6) + 1,
      author: {
        email: "author@example.com",
      },
      committedDate: date.toISOString(),
    };

    mockCommits.push(commit);
  }

  return mockCommits;
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
    const mockData = generateMockCommits(new Date(new Date().setDate(new Date().getDate() - 1)), 8, [0, 6]);
    console.log(mockData);
    const streakCandidates = getStreakCandidates(mockData);
    const streak = getCommitStreak(streakCandidates);

    console.log(streak);

    return uniqueCommits;
  } catch (error) {
    console.error(`Failed to fetch all commits for account ${accountId}: ${error}`);
    throw error;
  }
}
function getStreakCandidates(commits: Commit[]) {
  const commitDates = new Set<string>();

  for (let i = 0; i < commits.length; i++) {
    const currentCommit = commits[i];
    const currentDate = new Date(currentCommit.committedDate);
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    if (i === 0) {
      commitDates.add(currentCommit.committedDate.split("T")[0]);
    } else {
      const previousCommit = commits[i - 1];
      const previousDate = new Date(previousCommit.committedDate);
      const previousDay = previousDate.getDay();

      const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff > 1) {
        if (
          (currentDay === 1 && (previousDay === 5 || previousDay === 6)) || // Gap with Friday/Saturday on one side, Monday on other
          (previousDay === 1 && (currentDay === 5 || currentDay === 6))
        ) {
          commitDates.add(currentCommit.committedDate.split("T")[0]);
          commitDates.add(previousCommit.committedDate.split("T")[0]);
        } else {
          break; // Break the loop if the gap is not during the weekend
        }
      } else {
        commitDates.add(currentCommit.committedDate.split("T")[0]);
      }
    }
  }
  return Array.from(commitDates);
}

function getCommitStreak(commitDates: string[] | undefined): {
  workdayStreak: number;
  strictStreak: number;
  todayNeeded: boolean;
} {
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)); // Looks a bit weird but ... https://stackoverflow.com/a/51759591
  let workdayStreak = 0;
  let strictStreak = 0;
  let todayNeeded = false;

  if (!commitDates) {
    return { workdayStreak, strictStreak, todayNeeded };
  }

  // Calculate strict streak
  let streakStarted = false;
  while (commitDates.includes(yesterday.toISOString().split("T")[0])) {
    if (!streakStarted) {
      streakStarted = true;
      todayNeeded = !commitDates.includes(yesterday.toISOString().split("T")[0]); // Set to true only if today's commit is missing
    }
    strictStreak++;
    yesterday.setDate(yesterday.getDate() - 1); // Move to the previous day
  }
  strictStreak++; // Include yesterday's commit in the strict streak

  // Calculate workday streak
  for (let date of commitDates) {
    const commitDate = new Date(date);
    const day = commitDate.getDay();
    if (day !== 0 && day !== 6) {
      workdayStreak++;
    }
  }

  return { workdayStreak, strictStreak, todayNeeded };
}
