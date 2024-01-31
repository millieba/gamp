import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { languageQuery } from "./languagesUtils";
import { QueryResult } from "./languagesUtils";

export async function languagesServices(accountId: string) {
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
    let hasNextPage = true;
    let afterCursorRepositories = null;

    let hasNextPageOrg = true;
    let afterCursorOrg = null;

    let hasNextPageOrgRepositories = true;
    let afterCursorOrgRepositories = null;

    while (hasNextPage || hasNextPageOrg || hasNextPageOrgRepositories) {
      try {
        const result: QueryResult = await graphqlWithAuth<QueryResult>(
          languageQuery,
          {
            username: username,
            afterCursorOrg,
            afterCursorRepositories,
            afterCursorOrgRepositories,
          }
        );

        if (!result.user) {
          throw new Error("No data returned from GraphQL server");
        }

        if (hasNextPage) {
          if (result.user.repositories) {
            allData.push(...result.user.repositories.edges);
          }
        }

        if (hasNextPageOrg) {
          const orgNodes = result.user.organizations.nodes;
          for (const orgNode of orgNodes) {
            if (orgNode.repositories) {
              allData.push(...orgNode.repositories.edges);
              hasNextPageOrgRepositories =
                orgNode.repositories.pageInfo.hasNextPage;
              if (hasNextPageOrgRepositories) {
                afterCursorOrgRepositories =
                  orgNode.repositories.pageInfo.endCursor;
              }
            }
          }
        }

        hasNextPage = result.user.repositories.pageInfo.hasNextPage;
        afterCursorRepositories = result.user.repositories.pageInfo.endCursor;

        hasNextPageOrg = result.user.organizations.pageInfo.hasNextPage;
        afterCursorOrg = result.user.organizations.pageInfo.endCursor;
      } catch (error) {
        console.error("Error occurred:", error);
        throw new Error(
          `An error occurred while fetching languages: ${
            (error as Error).message
          }`
        );
      }
    }
    return allData;
  } catch (error) {
    console.error("Error occurred:", error);
    throw new Error(
      `An error occurred while fetching languages: ${(error as Error).message}`
    );
  }
}
