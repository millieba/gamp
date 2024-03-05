import { graphql } from "@octokit/graphql";
import { pullrequestsQuery, PRsGraphQLResponse, PRData } from "./pullrequestsUtils";
import { getLoggedInAccount } from "@/utils/user";
import prisma from "@/utils/prisma";

export async function fetchAllPullRequests(accountId: string): Promise<PRData[]> {
  const loggedInAccount = await getLoggedInAccount(accountId);
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${loggedInAccount?.access_token}`,
    },
  });

  const username = (await graphqlWithAuth<{ viewer: { login: string } }>(`query { viewer { login } }`)).viewer.login;
  let allData: PRData[] = [];
  let hasNextPagePr = true;
  let afterPr = null;

  while (hasNextPagePr) {
    try {
      const result: PRsGraphQLResponse = await graphqlWithAuth<PRsGraphQLResponse>(pullrequestsQuery, {
        username,
        afterPr,
      });
      const user = result.user;

      for (const edge of user.pullRequests.edges) {
        const comments = edge.node.comments ? edge.node.comments.edges.map((commentEdge) => commentEdge.node) : [];
        const reviews = edge.node.reviews ? edge.node.reviews.edges.map((reviewEdge) => reviewEdge.node) : [];

        allData.push({
          id: edge.node.id,
          title: edge.node.title,
          createdAt: edge.node.createdAt,
          merged: edge.node.merged,
          mergedAt: edge.node.mergedAt,
          comments: comments,
          reviews: reviews,
        });
      }

      hasNextPagePr = user.pullRequests.pageInfo.hasNextPage;
      afterPr = user.pullRequests.pageInfo.endCursor;
    } catch (error) {
      console.error("An error occurred while fetching pull requests:", error);
      throw error;
    }
  }
  return allData;
}

export async function fetchPullRequestVariables(accountId: string) {
  try {
    const data = await fetchAllPullRequests(accountId);
    const createdAndMergedPrs = calculateMergedAndCreatedPrs(data);
    return {
      createdPrs: data.length,
      createdAndMergedPrs: createdAndMergedPrs,
      pullRequests: data,
    };
  } catch (error) {
    console.error("An error occurred while fetching pull request variables:", error);
    throw error;
  }
}

// function to fetch the number of created and merged pull requests
export function calculateMergedAndCreatedPrs(data: PRData[]) {
  let count = 0;
  for (const pr of data) {
    if (pr) {
      count++;
    }
  }
  return count;
}

// fetch pull request variables from the database
export async function getPrVariablesFromDb(accountId: string) {
  try {
    const prData = await prisma.gitHubStats.findUnique({
      where: {
        accountId: accountId,
      },
      select: {
        createdPrs: true,
        createdAndMergedPrs: true,
      },
    });
    return prData;
  } catch (error) {
    console.error(
      `An error occurred while getting pull request variables for account ${accountId} from the database:`,
      error
    );
    throw error;
  }
}
