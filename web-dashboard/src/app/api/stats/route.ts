import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { getStatsFromDB } from "./statsSyncService";

export const GET = async () => {
  const session = await getServerSession(options);

  try {
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const stats = await getStatsFromDB(session.user.githubAccountId);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("An error occurred while getting stats from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
