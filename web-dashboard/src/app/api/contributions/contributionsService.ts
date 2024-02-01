import { graphql } from '@octokit/graphql';
import { getLoggedInAccount } from '@/utils/user';

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

export async function fetchContributionsInLastYear(accountId: string) {
    const loggedInAccount = await getLoggedInAccount(accountId);

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
        return user.contributionsCollection;

    } catch (error) {
        console.error("An error occurred while fetching contributions:", error);
        throw error;
    }
};