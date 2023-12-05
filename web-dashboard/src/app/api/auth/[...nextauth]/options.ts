import type { NextAuthOptions, TokenSet } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from '@/utils/prisma'

export const options: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            const [github] = await prisma.account.findMany({ // Updated provider to GitHub
                where: { userId: user.id, provider: "github" }, // Updated provider to GitHub
            });
            // check if github.expires_at is null before continuing
            if (!github.expires_at) return session;
            console.log("Used later: ", process.env.GITHUB_ID, process.env.GITHUB_SECRET, github.refresh_token, github.expires_at);

            if (github.expires_at * 1000 < Date.now()) {
                // If the access token has expired, try to refresh it
                try {
                    const response = await fetch("https://github.com/login/oauth/access_token", {
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            client_id: process.env.GITHUB_ID, // Adjusted environment variable
                            client_secret: process.env.GITHUB_SECRET, // Adjusted environment variable
                            grant_type: "refresh_token",
                            refresh_token: github.refresh_token,
                        }),
                        method: "POST",
                    });

                    console.log("Refreshing a user access token with a refresh token:", response.status, response.statusText);

                    const tokens: TokenSet = await response.json();
                    console.log("Tokens:", tokens);

                    if (!response.ok) throw tokens;

                    // Check if tokens.expires_in is a number before using it
                    let expiresIn = typeof tokens.expires_at === 'number' ? tokens.expires_at : 0;

                    await prisma.account.update({
                        data: {
                            access_token: tokens.access_token,
                            expires_at: Math.floor(Date.now() / 1000 + expiresIn),
                            refresh_token: tokens.refresh_token ?? github.refresh_token,
                        },
                        where: {
                            provider_providerAccountId: {
                                provider: "github",
                                providerAccountId: github.providerAccountId,
                            },
                        },
                    });
                } catch (error) {
                    console.error("Error refreshing access token", error);
                    session.error = "RefreshAccessTokenError";
                }
            }
            return session;
        },
    },
}
declare module "next-auth" {
    interface Session {
        error?: "RefreshAccessTokenError"
    }
}