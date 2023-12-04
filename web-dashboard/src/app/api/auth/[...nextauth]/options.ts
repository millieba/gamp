import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/utils/prisma'
import GitHubProvider from 'next-auth/providers/github'

export const options: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma), // TODO: Make this work
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET as string,
}