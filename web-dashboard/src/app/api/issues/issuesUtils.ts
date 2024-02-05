export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface QueryResult {
  user: {
    issues: {
      pageInfo: PageInfo;
      edges: {
        node: {
          assignees: {
            pageInfo: PageInfo;
            edges: {
              node: {
                name: string;
              };
            }[];
          };
          repository: {
            id: string;
            nameWithOwner: string;
          };
          createdAt: string;
          closedAt: string;
          state: string;
          titleHTML: string;
          body: string;
        };
      }[];
    };
  };
}

export const issuesQuery = `
  query ($username: String!, $afterIssues: String) {
    user(login: $username) {
      issues(first: 100, after: $afterIssues) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            assignees(first: 100) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  name
                }
              }
            }
            repository {
              id
              nameWithOwner
            }
            createdAt
            closedAt
            state
            titleHTML
            body
          }
        }
      }
    }
  }
  `;
