import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { getPreferencesFromDB } from "./preferenceService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const preferences = await getPreferencesFromDB(session.user.githubAccountId);
    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error("An error occurred while getting preferences from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
