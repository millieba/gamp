import type { NextAuthOptions, User } from 'next-auth'
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
            const [github] = await prisma.account.findMany({
                where: { userId: user.id, provider: "github" },
            });
            // check if github.expires_at is null before continuing, TODO: handle properly
            if (!github.expires_at) return session;

            if (github?.expires_at * 1000 < Date.now()) {
                // If the access token has expired, try to refresh it
                try {
                    const response = await fetch("https://github.com/login/oauth/access_token", {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.GITHUB_ID as string,
                            client_secret: process.env.GITHUB_SECRET as string,
                            grant_type: "refresh_token",
                            refresh_token: github.refresh_token as string,
                        }),
                        method: "POST",
                    });

                    console.log("Refreshing a user access token with a refresh token:", response.status, response.statusText);

                    const resText = await response.text();
                    const resParams = new URLSearchParams(resText);
                    const resObject = Object.fromEntries(resParams);

                    console.log("Response Object:", resObject)

                    // If the expires_in is a string, parse it into an integer
                    const expiresIn = typeof resObject.expires_in === "string" ? parseInt(resObject.expires_in) : resObject.expires_in;

                    await prisma.account.update({
                        data: {
                            access_token: resObject.access_token,
                            expires_at: Math.floor(Date.now() / 1000 + expiresIn),
                            refresh_token: resObject.refresh_token ?? github.refresh_token,
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

            session.user.userId = user.id; // Add userId to the session object
            return session;
        },
    },
}

declare module "next-auth" {
    interface ExtendedUser extends User { // Any extra fields we want to pass to the session object
        userId?: string;
    }

    interface Session {
        error?: "RefreshAccessTokenError";
        user: ExtendedUser;
    }
}