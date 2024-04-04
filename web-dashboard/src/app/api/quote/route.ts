import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getTodaysQuote } from "./quoteService";
import prisma from "@/utils/prisma";

export const GET = async () => {
  const session = await getServerSession(options);

  try {
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const quote = await getTodaysQuote(session.user.githubAccountId);

    // Add skipped quotes count to the response
    const account = await prisma.account.findUnique({
      where: { id: session.user.githubAccountId },
      select: { skippedQuotes: true },
    });
    const response = { ...quote, skippedQuotes: account?.skippedQuotes || 0 };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("An error occurred while getting today's quote from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
