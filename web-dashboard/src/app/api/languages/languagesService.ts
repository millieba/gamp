import prisma from "@/utils/prisma";
import { graphql } from "@octokit/graphql";
import { languageQuery } from "./languageUtils";
import { QueryResult } from "./languageUtils";
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
          console.error("No data returned from GraphQL server");
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

export async function calculateLanguageSizes(accountId: string) { // Finds all languages used in all repos, and sums the bytes written in each language
  try {
    const sizes: { [key: string]: number } = {}; // Key is a language name, value is the total bytes written in that language
    const data = await languagesServices(accountId);

    data.forEach((repo: Repository) => {
      repo.node.languages.edges.forEach((language: Language) => {
        if (sizes[language.node.name]) {
          sizes[language.node.name] += language.size;
        } else {
          sizes[language.node.name] = language.size;
        }
      });
    });

    return sizes;
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