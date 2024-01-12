import { getServerSession } from 'next-auth';
import { graphql } from '@octokit/graphql';
import { options } from '../auth/[...nextauth]/options';
import prisma from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { Organizations, Repositories } from '@/utils/types';

interface QueryResult {
  viewer: {
    organizations: Organizations;
    repositories: Repositories;
  }
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

  const query = `
  query getAllRepos {
    viewer {
      organizations(first: 100) {
        nodes {
          repositories(first: 100) {
            nodes {
              owner {
                login
              }
              name
            }
          }
        }
      }
      repositories(first: 100) {
        nodes {
          owner {
            login
          }
          name
        }
      }
    }
  }
  `;

  try {
    const result = await graphqlWithAuth<QueryResult>(query);
    const orgRepos = result.viewer.organizations.nodes.flatMap(org => org.repositories.nodes);
    const userRepos = result.viewer.repositories.nodes;
    const allRepos = [...orgRepos, ...userRepos].map(repo => ({ owner: repo.owner.login, name: repo.name }));

    return NextResponse.json({ repos: allRepos }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while fetching repositories' }, { status: 500 });
  }
};