export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface QueryResult {
  user: {
    pullRequests: {
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

export const pullrequestsQuery = `
query($username: String!, $afterPr: String, $afterCmt: String, $afterReview: String) {
  user(login: $username) {
    pullRequests(first: 100, after: $afterPr) {
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