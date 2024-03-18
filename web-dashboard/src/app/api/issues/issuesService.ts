import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { IssueQueryResult, IssueQueryResultEdges, IssueQueryResultNode } from "./issuesUtils";
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
        const result: IssueQueryResult = await graphqlWithAuth<IssueQueryResult>(issuesQuery, {
          afterIssues: afterCursorIssues,
        });

        if (!result.search) {
          throw new Error("No data returned from GraphQL server");
        }

        if (result) {
          allData.push(result.search);
        }

        hasNextPageIssues = result.search.pageInfo.hasNextPage;
        afterCursorIssues = result.search.pageInfo.endCursor;
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

export async function fetchIssueVariables(accountId: string) {
  try {
    const data = await fetchIssueCount(accountId);

    // Fetch only open assigned issues, and sort them by createdAt date in descending order
    let assignedIssueNode = data[0].edges.map((edge) => edge.node);
    assignedIssueNode = assignedIssueNode.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const openAssignedIssueNode = assignedIssueNode.filter((issue) => issue.state === "OPEN");

    // Fetching various stats using functions
    const issueCount = data[0].issueCount;
    const avgTimeToCloseIssues = calculateAvgTimeToCloseIssues(data);
    const closedIssueCount = calculateClosedIssueCount(data);
    return {
      issueCount: issueCount,
      avgTimeToCloseIssues: avgTimeToCloseIssues,
      closedIssueCount: closedIssueCount,
      data: data,
      openAssignedIssueNode: openAssignedIssueNode,
    };
  } catch (error) {
    console.error("An error occured while trying to fetch the issueCount:", error);
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
export function calculateAvgTimeToCloseIssues(results: IssueQueryResultEdges[]): number {
  let total = 0;
  let count = 0;

  for (const result of results) {
    result.edges.forEach((edge: IssueQueryResultNode) => {
      if (edge.node.state === "CLOSED" && edge.node.createdAt && edge.node.closedAt) {
        const diff = calculateTimeDifference(edge.node.createdAt, edge.node.closedAt);
        total += diff;
        count++;
      }
    });
  }

  if (count === 0) {
    return 0; // return null if no closed issues were found
  }

  return total / count;
}

// Function to calculate average time
export function calculateClosedIssueCount(results: IssueQueryResultEdges[]): number {
  let closedIssueCount = 0;

  results.forEach((result) => {
    result.edges.forEach((edge) => {
      if (edge.node.state === "CLOSED") {
        closedIssueCount += 1;
      }
    });
  });

  return closedIssueCount;
}

export async function getIssueVariablesFromDb(accountId: string) {
  try {
    const issueData = await prisma.gitHubStats.findUnique({
      where: { accountId: accountId },
      select: {
        issueCount: true,
        avgTimeToCloseIssues: true,
        closedIssueCount: true,
        assignedIssues: {
          select: {
            title: true,
            url: true,
            createdAt: true,
            closedAt: true,
            number: true,
            state: true,
          },
        },
      },
    });
    return issueData;
  } catch (error) {
    console.error(`An error occurred while getting issueCount for account ${accountId} from the database:`, error);
    throw error;
  }
}
