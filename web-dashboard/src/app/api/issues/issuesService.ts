import { graphql } from "@octokit/graphql";
import { issuesQuery, QueryResult } from "./issuesUtils";
import { getLoggedInAccount } from "@/utils/user";

export async function issuesService(accountId: string) {
  try {
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
        console.error("An error occurred while paginating and fetching issues:", error);
        throw error;
      }
    }
    return allData;
  } catch (error) {
    console.error("An error occurred while fetching issues:", error);
    throw error;
  }
}
