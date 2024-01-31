import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { pullrequestsService } from "./pullrequestsService";

export const GET = async () => {
  const session = await getServerSession(options);

  if (!session || !session.user.githubAccountId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const pullrequests = await pullrequestsService(session.user.githubAccountId);
    return NextResponse.json(pullrequests, { status: 200 });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
