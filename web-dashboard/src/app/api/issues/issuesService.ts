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

    while (hasNextPageIssues) {
      try {
        const result: QueryResult = await graphqlWithAuth<QueryResult>(
          issuesQuery,
          {
            username: username,
            afterIssues: afterCursorIssues,
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
