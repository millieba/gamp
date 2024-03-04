import { graphql } from "@octokit/graphql";
import { pullrequestsQuery, PrQueryResult, PRServiceResponse, PRQueryResponse } from "./pullrequestsUtils";
import { getLoggedInAccount } from "@/utils/user";
import prisma from "@/utils/prisma";

export async function pullrequestsService(accountId: string): Promise<PRServiceResponse> {
  const loggedInAccount = await getLoggedInAccount(accountId);
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${loggedInAccount?.access_token}`,
    },
  });

  const username = (await graphqlWithAuth<{ viewer: { login: string } }>(`query { viewer { login } }`)).viewer.login;
  let allData: PRQueryResponse[] = [];
  let totalPRCount = 0;
  let hasNextPagePr = true;
  let afterPr = null;
  let hasNextPageCmt = true;
  let afterCmt = null;
  let hasNextPageReview = true;
  let afterReview = null;

  while (hasNextPagePr) {
    try {
      const result: PrQueryResult = await graphqlWithAuth<PrQueryResult>(pullrequestsQuery, {
        username,
        afterPr,
        afterCmt,
        afterReview,
      });
      const user = result.user;

      if (!totalPRCount) totalPRCount = user.pullRequests.totalCount;

      for (const edge of user.pullRequests.edges) {
        const prData: PRQueryResponse = {
          id: edge.node.id,
          comments: edge.node.comments
            ? {
                pageInfo: edge.node.comments.pageInfo,
                edges: edge.node.comments.edges.map((commentEdge) => ({
                  node: {
                    body: commentEdge.node.body,
                    url: commentEdge.node.url,
                    author: { url: commentEdge.node.author.url },
                  },
                })),
              }
            : undefined,
          title: edge.node.title,
          merged: edge.node.merged,
          createdAt: edge.node.createdAt,
          mergedAt: edge.node.mergedAt,
          reviews: edge.node.reviews
            ? {
                pageInfo: edge.node.reviews.pageInfo,
                edges: edge.node.reviews.edges.map((reviewEdge) => ({
                  node: {
                    body: reviewEdge.node.body,
                    author: { avatarUrl: reviewEdge.node.author.avatarUrl },
                  },
                })),
              }
            : undefined,
        };
        allData.push(prData);
        if (edge.node.comments && edge.node.comments.pageInfo.hasNextPage) {
          hasNextPageCmt = true;
          afterCmt = edge.node.comments.pageInfo.endCursor;
        }
        if (edge.node.reviews && edge.node.reviews.pageInfo.hasNextPage) {
          hasNextPageReview = true;
          afterReview = edge.node.reviews.pageInfo.endCursor;
        }
      }
      hasNextPagePr = user.pullRequests.pageInfo.hasNextPage;
      afterPr = user.pullRequests.pageInfo.endCursor;
    } catch (error) {
      console.error("An error occurred while fetching pull requests:", error);
      throw error;
    }
  }

  return { createdPrs: totalPRCount, PRData: allData };
}

export async function fetchPullRequestVariables(accountId: string) {
  try {
    const data = await pullrequestsService(accountId);
    const createdPrs = data.createdPrs;
    const createdAndMergedPrs = calculateMergedAndCreatedPrs(data);
    return {
      createdPrs: createdPrs,
      createdAndMergedPrs: createdAndMergedPrs,
      pullRequests: data.PRData,
    };
  } catch (error) {
    console.error("An error occurred while fetching pull request variables:", error);
    throw error;
  }
}

// function to fetch the number of created and merged pull requests
export function calculateMergedAndCreatedPrs(data: PRServiceResponse) {
  let count = 0;
  for (const pr of data.PRData) {
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
