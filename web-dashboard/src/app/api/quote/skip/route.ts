import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { skipQuote } from "../quoteService";
import { TooManyRequestsError } from "../../sync/syncService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const quote = await skipQuote(session.user.githubAccountId);
    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      return NextResponse.json({ error: error.message, retryAfter: error.retryAfter }, { status: 429 });
    } else {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
};
