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

export const languageQuery = `
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
    repositories(first: 50, after: $afterCursorRepositories) {
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