import { graphql } from "@octokit/graphql";
import prisma from "@/utils/prisma";
import { pullrequestsQuery, QueryResult } from "./pullrequestsUtils";

export async function pullrequestsService(accountId: string) {
  const loggedInAccount = await prisma.account.findUnique({
    where: { id: accountId },
  });

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

  let hasNextPagePr = true;
  let afterPr = null;

  let hasNextPageCmt = true;
  let afterCmt = null;

  let hasNextPageReview = true;
  let afterReview = null;

  while (hasNextPagePr) {
    try {
      const result: QueryResult = await graphqlWithAuth<QueryResult>(pullrequestsQuery, {
        username: username,
        afterPr: afterPr,
        afterCmt: afterCmt,
        afterReview: afterReview,
      });

      const user = result.user;

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
      console.error(error);
      break;
    }
  }
  return allData;
}
