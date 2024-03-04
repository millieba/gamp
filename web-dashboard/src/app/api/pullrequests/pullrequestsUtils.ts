export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface PrQueryResult {
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
          createdAt: Date;
          mergedAt: Date;
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

export type PRData = {
  body?: string;
  url?: string;
  author?: {
    url?: string;
    avatarUrl?: string;
  };
  id?: string;
  comments?: {
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
  title?: string;
  merged?: boolean;
  createdAt?: Date;
  mergedAt?: Date;
  reviews?: {
    pageInfo?: PageInfo;
    edges?: {
      node?: {
        body?: string;
        author?: {
          avatarUrl?: string;
        };
      };
    }[];
  };
};

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
