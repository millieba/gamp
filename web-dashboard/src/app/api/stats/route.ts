import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import prisma from "@/utils/prisma";

export const GET = async () => {
    try {
        const session = await getServerSession(options)

        if (!session || !session.user.githubAccountId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const stats = await prisma.account.findUnique({ // Get stats from database
            where: { id: session.user.githubAccountId },
            select: {
                githubStats: {
                    select: {
                        commitCount: true,
                        repoCount: true,
                        programmingLanguages: {
                            select: {
                                name: true,
                                bytesWritten: true,
                            },
                        },
                    }
                },
            },
        });

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error("An error occurred while getting stats from the database:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};