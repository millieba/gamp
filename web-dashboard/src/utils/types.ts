import { BadgeAward, BadgeDefinition } from "@prisma/client";

export interface RepositoryDetails {
  name: string;
  owner: string;
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

export interface Badge extends BadgeAward {
  badgeDefinition: BadgeDefinition;
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

// Types and interfaces for LanguageChart.tsx
export type DataItem = {
  name: string;
  value: number;
};

export type PieArcDatum = d3.PieArcDatum<DataItem>;

export interface Language {
  node: {
    name: string;
  };
  size: number;
}

export interface Repository {
  node: {
    languages: {
      edges: Language[];
    };
    createdAt: string | Date;
  };
}

export interface Data {
  languages: Repository[];
}
