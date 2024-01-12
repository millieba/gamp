import { getServerSession } from 'next-auth';
import { graphql } from '@octokit/graphql';
import { options } from '../auth/[...nextauth]/options';
import prisma from '@/utils/prisma';
import { NextResponse } from 'next/server';
import comparer from '@/utils/comparer';

interface Repository { nameWithOwner: string; }
interface Repositories { nodes: Repository[]; }
interface Viewer { repositories: Repositories; }
interface QueryResult { viewer: Viewer; }

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
  query {
      viewer {
        repositories(first: 100, affiliations: [OWNER, COLLABORATOR]) {
          nodes {
            nameWithOwner
          }
        }
      }
    }`;

  try {
    const result = await graphqlWithAuth<QueryResult>(query);
    const { viewer } = result;
    comparer(viewer.repositories.nodes);

    return NextResponse.json({ repos: viewer.repositories.nodes }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while fetching repositories' }, { status: 500 });
  }
};