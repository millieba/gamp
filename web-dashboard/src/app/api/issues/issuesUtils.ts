export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface QueryResult {
  search: {
    issueCount: number;
    pageInfo: PageInfo;
    edges: {
      node: {
        title: string;
        url: string;
        createdAt: string;
        closedAt: string;
        number: number;
        state: string;
      };
    }[];
  };
}
