import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { QueryResult } from "./issuesUtils";
import { getLoggedInAccount } from "@/utils/user";

export async function fetchIssueCount(accountId: string) {
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

        console.log(allData);

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

export async function issueCount(accountId: string) {
  try {
    const data = await fetchIssueCount(accountId);
    console.log(data[0].issueCount);
    return data[0].issueCount;
  } catch (error) {
    console.error("An error occured while trying to fetch the issueCount:", error);
    throw error;
  }
}

export async function getIssueCountFromDb(accountId: string) {
  try {
    const issueCount = await prisma.gitHubStats.findUnique({
      where: { accountId: accountId },
      select: {
        issueCount: true,
      },
    });
    return issueCount;
  } catch (error) {
    console.error(
      `An error occurred while getting issueCount for account ${accountId} from the database:`,
      error
    );
    throw error;
  }
}