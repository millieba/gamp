import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { issuesQuery, QueryResult } from "./issuesUtils";

export async function issuesService(accountId: string) {
  try {
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
    let hasNextPageIssues = true;
    let afterCursorIssues = null;

    let hasNextPageAssignee = true;
    let afterCursorAssignee = null;

    while (hasNextPageIssues || hasNextPageAssignee) {
      try {
        const result: QueryResult = await graphqlWithAuth<QueryResult>(
          issuesQuery,
          {
            username: username,
            afterCursorIssues,
            afterCursorAssignee,
          }
        );

        if (!result.user) {
          throw new Error("No data returned from GraphQL server");
        }

        if (hasNextPageIssues) {
          if (result.user.issues) {
            allData.push(...result.user.issues.edges);
          }
        }

        for (const edge of result.user.issues.edges) {
          if (hasNextPageAssignee) {
            allData.push(...edge.node.assignees.edges.map((edge) => edge.node));
            hasNextPageAssignee = edge.node.assignees.pageInfo.hasNextPage;
            afterCursorAssignee = edge.node.assignees.pageInfo.endCursor;
          }
        }

        hasNextPageIssues = result.user.issues.pageInfo.hasNextPage;
        afterCursorIssues = result.user.issues.pageInfo.endCursor;
      } catch (error) {
        console.error("Error occurred:", error);
        throw new Error(
          `An error occurred while fetching issues: ${
            (error as Error).message
          }`
        );
      }
    }
    return allData;
  } catch (error) {
    console.error("Error occurred:", error);
    throw new Error(
      `An error occurred while fetching issues: ${(error as Error).message}`
    );
  }
}
