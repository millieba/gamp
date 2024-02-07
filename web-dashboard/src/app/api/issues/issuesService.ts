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

        if (result) {
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
    const issueCount = data[0].issueCount;
    const avgTimeToCloseIssues = calculateAvgTimeToCloseIssues(data);
    const closedIssueCount = calculateClosedIssueCount(data);
    return [issueCount, avgTimeToCloseIssues, closedIssueCount];
  } catch (error) {
    console.error(
      "An error occured while trying to fetch the issueCount:",
      error
    );
    throw error;
  }
}

// Function to calculate time difference
function calculateTimeDifference(createdAt: string, closedAt: string): number {
  const startDate = new Date(createdAt);
  const endDate = new Date(closedAt);
  return endDate.getTime() - startDate.getTime();
}

// Function to calculate average time
export function calculateAvgTimeToCloseIssues(results: any): number | null {
  let total = 0;
  let count = 0;

  results.forEach((result: { edges: any[] }) => {
    result.edges.forEach((edge) => {
      if (edge.node.state === "CLOSED" && edge.node.createdAt && edge.node.closedAt) {
        const diff = calculateTimeDifference(
          edge.node.createdAt,
          edge.node.closedAt
        );
        total += diff;
        count++;
      }
    });
  });

  if (count === 0) {
    return 0; // return null if no closed issues were found
  }

  return total / count;
}

// Function to calculate average time
export function calculateClosedIssueCount(results: any): number {
  let closedIssueCount = 0;

  results.forEach((result: { edges: any[] }) => {
    result.edges.forEach((edge) => {
      if (edge.node.state === "CLOSED") {
        closedIssueCount += 1;
      }
    });
  });

  return closedIssueCount;
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
