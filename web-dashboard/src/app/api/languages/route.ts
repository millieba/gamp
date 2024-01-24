import { getServerSession } from "next-auth";
import { graphql } from "@octokit/graphql";
import { options } from "../auth/[...nextauth]/options";
import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface QueryResult {
  user: {
    repositories: {
      nodes: {
        owner: {
          login: string;
        };
        name: string;
        languages: {
          edges: {
            size: number;
            node: {
              name: string;
            };
          }[];
          pageInfo: PageInfo;
        };
      }[];
      pageInfo: PageInfo;
    };
  };
}

export const GET = async () => {
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const loggedInAccount = await prisma.account.findFirst({
    where: { userId: session?.user?.userId, provider: "github" },
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

  const query = `
  query ($username: String!, $afterCursorRepositories: String, $afterCursorOrg: String, $afterCursorOrgRepositories: String) {
    user(login: $username) {
      organizations(first: 10, after: $afterCursorOrg) {
        totalCount
        nodes {
          repositories(first: 100, after: $afterCursorOrgRepositories) {
            totalCount
            edges {
              node {
                owner {
                  login
                }
                name
                languages(first: 100) {
                  totalCount
                  totalSize
                  edges {
                    size
                    node {
                      name
                    }
                  }
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      repositories(first: 100, after: $afterCursorRepositories) {
        edges {
          node {
            owner {
              login
            }
            name
            languages(first: 100) {
              totalCount
              totalSize
              edges {
                size
                node {
                  name
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

  let allData = [];
  let hasNextPage = true;
  let afterCursorRepositories = null;

  let hasNextPageOrg = true;
  let afterCursorOrg = null;

  let hasNextPageOrgRepositories = true;
  let afterCursorOrgRepositories = null;

  
  let user: QueryResult["user"] | undefined;
  
  while (hasNextPage) {
    try {
      const result = await graphqlWithAuth<{ data: QueryResult }>(query, {
        username: username,
        afterCursorRepositories,
      });
      
      
      user = result.user;
      
      if (!result.user) {
        throw new Error("No data returned from GraphQL server");
      }
      
      if (hasNextPage) {
        if (result.user.repositories) {
          allData.push(...result.user.repositories.edges);
        }
      }

      // Check if there are more repositories in one organization
      const numberOfNodes = result.user.organizations.nodes.length;
      if (numberOfNodes > 0) {
        for (let i = 0; i < numberOfNodes; i++) {
          hasNextPageOrgRepositories = result.user.organizations.nodes[i].repositories.pageInfo.hasNextPage;
          if (hasNextPageOrgRepositories) {
            afterCursorOrgRepositories = result.user.organizations.nodes[i].repositories.pageInfo.endCursor;
          }
          const edges = result.user.organizations.nodes[i].repositories.edges;
          if (edges) {
            allData.push(...edges);
          }
        }
      }
              
      hasNextPage = result.user.repositories.pageInfo.hasNextPage;
      afterCursorRepositories = result.user.repositories.pageInfo.endCursor;

      hasNextPageOrg = result.user.organizations.pageInfo.hasNextPage;
      afterCursorOrg = result.user.organizations.pageInfo.endCursor;

    } catch (error) {
      console.error("Error occurred:", error);
      return NextResponse.json(
        {
          error: `An error occurred while fetching languages: ${error.message}`,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ languages: allData }, { status: 200 });
};
