import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { fetchRepos } from "./repoService";

export const GET = async () => {
  try {
    const session = await getServerSession(options)
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const repos = await fetchRepos(session.user.githubAccountId);
    return NextResponse.json(repos, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
