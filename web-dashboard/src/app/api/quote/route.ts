import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getTodaysQuote } from "./quoteService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const quote = await getTodaysQuote(session.user.githubAccountId);
    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    console.error("An error occurred while getting today's quote from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
