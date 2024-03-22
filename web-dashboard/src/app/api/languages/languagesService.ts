import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { languageQuery, QueryResult } from "./languagesUtils";
import { Language, Repository } from "@/utils/types";
import { getLoggedInAccount } from "@/utils/user";

export async function languagesServices(accountId: string) {
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
    let hasNextPageRepositories = true;
    let afterCursorRepositories = null;

    let hasNextPageOrg = true;
    let afterCursorOrg = null;

    let hasNextPageOrgRepositories = true;
    let afterCursorOrgRepositories = null;

    while (hasNextPageRepositories || hasNextPageOrg) {
      try {
        const result: QueryResult = await graphqlWithAuth<QueryResult>(languageQuery, {
          username: username,
          afterCursorOrg,
          afterCursorRepositories,
          afterCursorOrgRepositories,
        });

        if (!result.user) {
          console.error("No data returned from GraphQL server");
          throw new Error("No data returned from GraphQL server");
        }

        if (hasNextPageRepositories) {
          if (result.user.repositories) {
            allData.push(...result.user.repositories.edges);
          }
        }

        if (hasNextPageOrg) {
          const orgNodes = result.user.organizations.nodes;
          for (const orgNode of orgNodes) {
            if (orgNode.repositories) {
              allData.push(...orgNode.repositories.edges);
              hasNextPageOrgRepositories = orgNode.repositories.pageInfo.hasNextPage;
              if (hasNextPageOrgRepositories) {
                afterCursorOrgRepositories = orgNode.repositories.pageInfo.endCursor;
              }
            }
          }
        }

        hasNextPageRepositories = result.user.repositories.pageInfo.hasNextPage;
        afterCursorRepositories = result.user.repositories.pageInfo.endCursor;

        hasNextPageOrg = result.user.organizations.pageInfo.hasNextPage;
        afterCursorOrg = result.user.organizations.pageInfo.endCursor;
      } catch (error) {
        console.error("An error occurred while paginating and fetching languages:", error);
        throw error;
      }
    }
    return allData;
  } catch (error) {
    console.error("An error occurred while fetching languages:", error);
    throw error;
  }
}

export async function calculateLanguageSizes(accountId: string) {
  try {
    const sizes: { [key: string]: number } = {};
    const firstUsedAt: { [key: string]: string } = {}; // Key is a language name, value is the earliest date it was used

    const data = await languagesServices(accountId);

    data.forEach((repo: any) => {
      const createdAt = new Date(repo.node.createdAt);
      repo.node.languages.edges.forEach((language: any) => {
        if (sizes[language.node.name]) {
          sizes[language.node.name] += language.size;
          // If the current repository's creation date is earlier than the stored date, update it
          if (createdAt < new Date(firstUsedAt[language.node.name])) {
            firstUsedAt[language.node.name] = repo.node.createdAt;
          }
        } else {
          sizes[language.node.name] = language.size;
          firstUsedAt[language.node.name] = repo.node.createdAt;
        }
      });
    });

    // Combine the sizes and firstUsedAt objects into a single object
    const result = Object.keys(sizes).map((key) => ({
      language: key,
      size: sizes[key],
      firstUsedAt: firstUsedAt[key],
    }));

    return result;
  } catch (error) {
    console.error("An error occurred while calculating language sizes:", error);
    throw error;
  }
}

export async function getLanguageSizesFromDB(accountId: string) {
  try {
    const languages = await prisma.gitHubStats.findUnique({
      where: { accountId: accountId },
      select: {
        programmingLanguages: {
          select: {
            name: true,
            bytesWritten: true,
            firstUsedAt: true,
          },
        },
      },
    });
    return languages;
  } catch (error) {
    console.error("An error occurred while getting language sizes from database:", error);
    throw error;
  }
}
