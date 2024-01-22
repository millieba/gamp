import { getServerSession } from 'next-auth';
import { graphql } from '@octokit/graphql';
import { options } from '../auth/[...nextauth]/options';
import prisma from '@/utils/prisma';
import { NextResponse } from 'next/server';

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
  const session = await getServerSession(options)

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const loggedInAccount = await prisma.account.findFirst({
    where: { userId: session?.user?.userId, provider: "github" },
  });

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${loggedInAccount?.access_token}`,
    },
  });

  const username = (await graphqlWithAuth<{ viewer: { login: string } }>(`
    query {
      viewer {
        login
      }
    }
  `)).viewer.login;

    const query = `
  query {
    user(login: "${username}") {
      repositories(first: 3) {
        totalCount
        nodes {
          owner {
            login
          }
          name
          languages(first: 2) {
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
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
  `;

  try {
    const result = await graphqlWithAuth<QueryResult>(query, { username });
    const { user } = result;

    return NextResponse.json({ languages: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while fetching languages' }, { status: 500 });
  }
};