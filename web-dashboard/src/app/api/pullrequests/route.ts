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
    pullRequests: {
      pageInfo: PageInfo;
      edges: {
        node: {
          id: string;
          comments: {
            pageInfo: PageInfo;
            edges: {
              node: {
                body: string;
                url: string;
                author: {
                  url: string;
                };
              };
            }[];
          };
          title: string;
          merged: boolean;
          reviews: {
            pageInfo: PageInfo;
            edges: {
              node: {
                body: string;
                author: {
                  avatarUrl: string;
                };
              };
            }[];
          };
        };
      }[];
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
  query($username: String!, $afterPr: String, $afterCmt: String, $afterReview: String) {
    user(login: $username) {
      pullRequests(first: 100, after: $afterPr) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id,
            comments(first: 10, after: $afterCmt){
              pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                node {
                  body,
                  url,
                  author {
                    url
                  }
                }
              }
            },
            title,
            merged,
            reviews(first: 10, after: $afterReview) {
              pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                node {
                  body,
                  author {
                    avatarUrl
                  }
                }
              } 
            }
          }
        }
      }
    }
  }
`;

  let allData = [];

  let hasNextPagePr = true;
  let afterPr = null;

  let hasNextPageCmt = true;
  let afterCmt = null;

  let hasNextPageReview = true;
  let afterReview = null;

  let user: QueryResult["user"] | undefined;

  while (hasNextPagePr || hasNextPageCmt || hasNextPageReview) {
    try {
      const result = await graphqlWithAuth<{ data: any }>(query, {
        username: username,
        afterPr: afterPr,
        afterCmt: afterCmt,
        afterReview: afterReview,
      });

        const user = result.user;
        console.log(user.pullRequests.edges[0]);

        allData.push(user.pullRequests);

        hasNextPagePr = user.pullRequests.pageInfo.hasNextPage;
        hasNextPageCmt = false;
        hasNextPageReview = false;

        } catch (error) {
            console.error("Error occurred:", error);
            return NextResponse.json(
                {
                    error: `An error occurred while fetching pull requests: ${error.message}`,
                },
                { status: 500 }
                );
            }
        }
        

        return NextResponse.json({ languages: allData }, { status: 200 });
    };
    