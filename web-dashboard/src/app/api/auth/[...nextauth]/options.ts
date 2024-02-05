import type { NextAuthOptions, User } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from '@/utils/prisma';

const adapter = PrismaAdapter(prisma);
const relative_expires_at = 3600; // Expire sessions and access tokens after 1 hour
const expires_at = Math.floor(Date.now() / 1000) + relative_expires_at;

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
        console.log("Token deleted successfully!");
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
    session: {
        maxAge: relative_expires_at,
    },
    callbacks: {
        async session({ session, user }) {
            const [githubAccount] = await prisma.account.findMany({
                where: { userId: user.id, provider: "github" },
            });

            // If there is no expires_at field, return the session as is (no need to check if the token is expired)
            if (!githubAccount.expires_at) return session;

            if (githubAccount.expires_at * 1000 < Date.now() && session.error !== "RefreshAccessTokenError") {
                session.error = "RefreshAccessTokenError";
                try {
                    console.log("Deleting access token", githubAccount.access_token);
                    await deleteTokenFromGitHub(
                        githubAccount.access_token as string,
                        process.env.GITHUB_ID as string,
                        process.env.GITHUB_SECRET as string
                    );
                    // Delete the user's sessions as their access token is no longer valid
                    await prisma.session.deleteMany({ where: { userId: user.id } });

                } catch (error) {
                    console.error("Error deleting access token", error);
                    session.error = "DeleteAccessTokenError";
                }
            }

            session.user.userId = user.id; // Add userId to the session object
            session.user.githubAccountId = githubAccount.id; // Add githubAccountId to the session object
            session.user.lastSync = githubAccount.lastSync; // Add lastSync to the session object
            return session;
        },
        async signIn({ user, account }) {
            if (user && account && adapter) {
                try {
                    // In our app, one user can have many accounts, but one account can only belong to one user
                    // So the first time a user signs in, we need to first create the user and then the account

                    await prisma.user.upsert({ // Upsert the user (update if it exists, otherwise create)
                        where: { id: user.id },
                        update: {
                            name: user.name,
                            email: user.email,
                            image: user.image,
                        },
                        create: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                        },
                    });

                    await prisma.account.upsert({ // Now that we know the user exists, we can upsert the account
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
                            lastSync: null,
                        },
                    });

                }
                catch (err) {
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
        githubAccountId?: string;
        lastSync: Date | null;
    }

    interface Session {
        error?: "RefreshAccessTokenError" | "DeleteAccessTokenError";
        user: ExtendedUser;
    }
}
