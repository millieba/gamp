import { getServerSession } from 'next-auth';
import { graphql } from '@octokit/graphql';
import { options } from '../auth/[...nextauth]/options';
import prisma from '@/utils/prisma';
import { NextResponse } from 'next/server';

interface ContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
}

interface Week {
  contributionDays: ContributionDay[];
  firstDay: string;
}

interface ContributionCalendar {
  colors: string[];
  totalContributions: number;
  weeks: Week[];
}

interface ContributionsCollection {
  contributionCalendar: ContributionCalendar;
}

interface User {
  name: string;
  contributionsCollection: ContributionsCollection;
}

interface QueryResult {
  user: User;
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

  // Get the logged in user's username
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
        name
        contributionsCollection {
          contributionCalendar {
            colors
            totalContributions
            weeks {
              contributionDays {
                color
                contributionCount
                date
                weekday
              }
              firstDay
            }
          }
        }
      }
    }
  `;

  try {
    const result = await graphqlWithAuth<QueryResult>(query, { username });
    const { user } = result;

    return NextResponse.json({ contributions: user.contributionsCollection }, { status: 200 });
  } catch (error) {
    console.error("An error occurred while fetching contributions:", error);
    return NextResponse.json({ error: 'An error occurred while fetching contributions' }, { status: 500 });
  }
};