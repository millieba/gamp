import { getLoggedInAccount } from "@/utils/user";
import { graphql } from "@octokit/graphql";

interface OrgsResult {
    viewer: {
        organizations: {
            pageInfo: {
                endCursor: string;
                hasNextPage: boolean;
            };
            edges: {
                node: {
                    name: string;
                };
            }[];
        };
    };
}

export async function fetchOrgs(accountId: string) {
    try {
        const loggedInAccount = await getLoggedInAccount(accountId);
        let orgs: string[] = [];
        let hasNextPage = true;
        let cursor = null;

        const graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ${loggedInAccount?.access_token}`,
            },
        });

        while (hasNextPage) {
            // Use graphql to get all organizations, with pagination
            const result: OrgsResult = await graphqlWithAuth<OrgsResult>(`
                query($orgsCursor: String) {
                    viewer {
                        organizations(first: 100, after: $orgsCursor) {
                            pageInfo {
                                endCursor
                                hasNextPage
                            }
                            edges {
                                node {
                                    name
                                }
                            }
                        }
                    }
                }
            `, { orgsCursor: cursor });

            const viewer = result.viewer;
            orgs.push(...viewer.organizations.edges.map(edge => edge.node.name));
            hasNextPage = viewer.organizations.pageInfo.hasNextPage;
            cursor = viewer.organizations.pageInfo.endCursor;
        }

        return { orgs: orgs };
    } catch (error) {
        console.error(`Failed to fetch organizations for account ${accountId}: ${error}`);
        throw error;
    }
}