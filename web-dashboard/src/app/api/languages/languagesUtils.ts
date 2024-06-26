export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface QueryResult {
  user: {
    organizations: {
      nodes: {
        repositories: {
          edges: {
            node: {
              createdAt: Date;
              owner: {
                login: string;
              };
              name: string;
              languages: {
                edges: {
                  node: {
                    name: string;
                  };
                  size: number;
                }[];
              };
            };
          }[];
          pageInfo: PageInfo;
        };
      }[];
      pageInfo: PageInfo;
    };
    repositories: {
      edges: {
        node: {
          createdAt: Date;
          owner: {
            login: string;
          };
          name: string;
          languages: {
            edges: {
              node: {
                name: string;
              };
              size: number;
            }[];
          };
        };
      }[];
      pageInfo: PageInfo;
    };
  };
}

export const languageQuery = `#graphql
query ($username: String!, $afterCursorRepositories: String, $afterCursorOrg: String, $afterCursorOrgRepositories: String) {
  user(login: $username) {
    organizations(first: 10, after: $afterCursorOrg) {
      totalCount
      nodes {
        repositories(first: 100, after: $afterCursorOrgRepositories) {
          totalCount
          edges {
            node {
              createdAt
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
          createdAt
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
