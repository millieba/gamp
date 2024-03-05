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
  comments: CommentNode[];
  title: string;
  merged: boolean;
  createdAt: string;
  mergedAt: string | null;
  reviews: ReviewNode[];
}

export interface CommentNode {
  body: string;
  url: string;
  author: {
    url: string;
  };
}

export interface ReviewNode {
  body: string;
  author: {
    avatarUrl: string;
  };
}

export const pullrequestsQuery = `
query($username: String!, $afterPr: String) {
  user(login: $username) {
    pullRequests(first: 10, after: $afterPr) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id,
          comments(first: 100){
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
          reviews(first: 100) {
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
