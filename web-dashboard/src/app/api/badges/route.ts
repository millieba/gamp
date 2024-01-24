import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { checkBadges } from "./checkBadgesService";

export const GET = async () => {
    try {
        const session = await getServerSession(options)

        if (!session || !session.user.githubAccountId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const badges = await checkBadges(session?.user?.githubAccountId);

        return NextResponse.json(badges, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};