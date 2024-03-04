export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface PRsGraphQLResponse {
  user: {
    pullRequests: {
      totalCount: number;
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
          createdAt: string;
          mergedAt: string;
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

export interface PRQueryResponse {
  id: string;
  comments?: {
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
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
  createdAt: string;
  mergedAt: string | null;
  reviews?: {
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
    edges?: {
      node?: {
        body?: string;
        author?: {
          avatarUrl?: string;
        };
      };
    }[];
  };
}

export interface PRServiceResponse {
  PRData: PRQueryResponse[];
  createdPrs: number;
}

export const pullrequestsQuery = `
query($username: String!, $afterPr: String, $afterCmt: String, $afterReview: String) {
  user(login: $username) {
    pullRequests(first: 100, after: $afterPr) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id,
          comments(first: 100, after: $afterCmt){
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
          createdAt,
          mergedAt,
          reviews(first: 100, after: $afterReview) {
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
