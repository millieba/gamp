export interface RepositoryDetails {
    name: string;
    description: string;
}

export interface User {
    date: string;
    email: string;
    name: string;
}

export interface Commit {
    committer?: User;
    repositoryName: string;
    date: string;
    message: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    image: string;
    points: number;
    type: string;
    threshold: number;
  }


// GraphQL types
export interface Owner {
    login: string;
}

export interface RepositoryNode {
    owner: Owner;
    name: string;
}

export interface Repositories {
    nodes: RepositoryNode[];
}

export interface OrganizationNode {
    repositories: Repositories;
}

export interface Organizations {
    nodes: OrganizationNode[];
}