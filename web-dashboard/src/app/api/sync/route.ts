import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { syncWithGithub, TooManyRequestsError } from "./syncService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    await syncWithGithub(session.user.githubAccountId);
    console.log(
      `\u21BB \u21BB \u21BB \u21BB \u21BB  Sync successful for ${session.user.email} - ${new Date().toLocaleString()}`
    );
    return NextResponse.json({ message: "Sync successful" }, { status: 200 });
  } catch (error) {
    const session = await getServerSession(options);
    console.error(`X X X X X  Sync failed for ${session?.user.email} - ${new Date().toLocaleString()}, error:`, error);
    if (error instanceof TooManyRequestsError) {
      return NextResponse.json({ error: error.message, retryAfter: error.retryAfter }, { status: 429 });
    } else {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
};
