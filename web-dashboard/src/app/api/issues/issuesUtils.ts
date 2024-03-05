export interface PageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface IssueQueryResult {
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

export interface IssueQueryResultEdges {
  edges: {
    node: {
      title: string;
      url: string;
      createdAt: string;
      closedAt: string | null;
      number: number;
      state: string;
    };
  }[];
}

export interface IssueQueryResultNode {
  node: {
    title: string;
    url: string;
    createdAt: string;
    closedAt: string | null;
    number: number;
    state: string;
  };
}
[];
