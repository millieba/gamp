import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { fetchOrgs } from "./orgsService";

export const GET = async () => {
    try {
        const session = await getServerSession(options);
        if (!session || !session.user.githubAccountId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const orgs = await fetchOrgs(session.user.githubAccountId);
        return NextResponse.json(orgs, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
