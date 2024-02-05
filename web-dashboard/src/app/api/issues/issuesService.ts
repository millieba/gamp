import { graphql } from "@octokit/graphql";
import { QueryResult } from "./issuesUtils";
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

    const issuesQuery = `
query ($afterIssues: String) {
  search(query: "is:issue assignee:${username}", type: ISSUE, first: 100, after: $afterIssues) {
  issueCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        ... on Issue {
        title
          url
          createdAt
          closedAt
          number
          state
         
        }
      }
    }
  }
}
  `;

    let allData = [];
    let hasNextPageIssues = true;
    let afterCursorIssues = null;

    while (hasNextPageIssues) {
      try {
        const result: QueryResult = await graphqlWithAuth<QueryResult>(
          issuesQuery,
          {
            afterIssues: afterCursorIssues,
          }
        );

        if (!result.search) {
          throw new Error("No data returned from GraphQL server");
        }

        if (result.search) {
          allData.push(result.search);
        }

        hasNextPageIssues = result.search.pageInfo.hasNextPage;
        afterCursorIssues = result.search.pageInfo.endCursor;
      } catch (error) {
        console.error(
          "An error occurred while paginating and fetching issues:",
          error
        );
        throw error;
      }
    }
    return allData;
  } catch (error) {
    console.error("An error occurred while fetching issues:", error);
    throw error;
  }
}
