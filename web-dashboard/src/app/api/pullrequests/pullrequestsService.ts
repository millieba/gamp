import { graphql } from "@octokit/graphql";
import { pullrequestsQuery, PrQueryResult, PRData } from "./pullrequestsUtils";
import { getLoggedInAccount } from "@/utils/user";
import prisma from "@/utils/prisma";

export async function pullrequestsService(accountId: string) {
  const loggedInAccount = await getLoggedInAccount(accountId);

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${loggedInAccount?.access_token}`,
    },
  });

  const username = (
    await graphqlWithAuth<{ viewer: { login: string } }>(`
      query {
        viewer {
          login
        }
      }
    `)
  ).viewer.login;

  let allData = [];
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
        username: username,
        afterPr: afterPr,
        afterCmt: afterCmt,
        afterReview: afterReview,
      });

      const user = result.user;

      if (!totalPRCount) {
        totalPRCount = user.pullRequests.totalCount;
      }

      if (hasNextPagePr) {
        if (user.pullRequests) {
          allData.push(...user.pullRequests.edges.map((edge) => edge.node));
        }
        hasNextPagePr = user.pullRequests.pageInfo.hasNextPage;
        afterPr = user.pullRequests.pageInfo.endCursor;
      }

      for (const edge of user.pullRequests.edges) {
        if (hasNextPageCmt && edge.node.comments.pageInfo.hasNextPage) {
          allData.push(...edge.node.comments.edges.map((edge) => edge.node));
          hasNextPageCmt = edge.node.comments.pageInfo.hasNextPage;
          afterCmt = edge.node.comments.pageInfo.endCursor;
        }
        if (hasNextPageReview && edge.node.reviews.pageInfo.hasNextPage) {
          allData.push(...edge.node.reviews.edges.map((edge) => edge.node));
          hasNextPageReview = edge.node.reviews.pageInfo.hasNextPage;
          afterReview = edge.node.reviews.pageInfo.endCursor;
        }
      }
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
    const createdAndMergedPrs = calculateMergedAndCreatedPrs(data.PRData);
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
export function calculateMergedAndCreatedPrs(data: PRData[]) {
  let count = 0;
  for (const pr of data) {
    if (pr?.merged) {
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
