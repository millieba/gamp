export interface RepositoryDetails {
    name: string;
    description: string;
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