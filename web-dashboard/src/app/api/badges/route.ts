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

        const badges = await prisma.account.findUnique({ // Get badges from database
            where: { id: session.user.githubAccountId },
            select: { badges: true },
        });

        return NextResponse.json(badges, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};