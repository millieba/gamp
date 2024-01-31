import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { issuesService } from "./issuesService";

export const GET = async () => {
  const session = await getServerSession(options);

  if (!session || !session.user.githubAccountId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const issues = await issuesService(session.user.githubAccountId);
    return NextResponse.json(issues, { status: 200 });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
