import type { NextAuthOptions, User } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from '@/utils/prisma';

const adapter = PrismaAdapter(prisma);

async function deleteTokenFromGitHub(accessToken: string, clientId: string, clientSecret: string) {
    const apiUrl = `https://api.github.com/applications/${clientId}/token`;

    const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            access_token: accessToken,
        }),
    });

    if (!response.ok) {
        const errorMessage = `Failed to delete token from GitHub. Status: ${response.status}, ${response.statusText}`;
        console.error(errorMessage);
    } else {
        console.log("Token deleted successfully");
        // Redirect the user to the login page
    }
}

export const options: NextAuthOptions = {
    adapter: adapter,
    providers: [
        GitHubProvider({
            id: "github",
            name: "GitHub",
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
            authorization: {
                params: {
                    scope: "read:user user:email repo read:org",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            const [githubAccount] = await prisma.account.findMany({
                where: { userId: user.id, provider: "github" },
            });

            // Check if github.expires_at is null before continuing, TODO: handle properly
            if (!githubAccount.expires_at) return session;

            if (githubAccount.expires_at * 1000 < Date.now()) {
                try {
                    console.log("Deleting access token", githubAccount.access_token);
                    // Delete the access token from GitHub
                    await deleteTokenFromGitHub(
                        githubAccount.access_token as string,
                        process.env.GITHUB_ID as string,
                        process.env.GITHUB_SECRET as string
                    );

                    // Force the user to re-authenticate to get a new token
                    session.error = "RefreshAccessTokenError";
                } catch (error) {
                    console.error("Error deleting access token", error);
                    session.error = "DeleteAccessTokenError";
                }
            }

            session.user.userId = user.id; // Add userId to the session object
            return session;
        },
        async signIn({ user, account }) {
            if (user && account && adapter && adapter.getUser) {
                try {
                    const userFromDatabase = await adapter.getUser(user.id);

                    // Calculate the expires_at value
                    const expires_at = Math.floor(Date.now() / 1000) + 3600; // Set expiry to 1 hour

                    if (userFromDatabase) {
                        await prisma.account.upsert({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                },
                            },
                            update: {
                                access_token: account.access_token,
                                expires_at: expires_at,
                                id_token: account.id_token,
                                session_state: account.session_state,
                                scope: account.scope,
                            },
                            create: {
                                type: 'oauth',
                                access_token: account.access_token,
                                expires_at: expires_at,
                                id_token: account.id_token,
                                session_state: account.session_state,
                                scope: account.scope,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                userId: user.id,
                            },
                        });
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        console.error(err.message);
                    }
                }
            }

            return true;
        },
    },
};

declare module "next-auth" {
    interface ExtendedUser extends User {
        userId?: string;
    }

    interface Session {
        error?: "RefreshAccessTokenError" | "DeleteAccessTokenError";
        user: ExtendedUser;
    }
}
