import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { prepareCommitsForDB } from "./commitsService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const maxRetries = 3;
    let retries = 0;
    let commits;

    while (retries < maxRetries) {
      try {
        commits = await prepareCommitsForDB(session.user.githubAccountId);
        console.log(`Commits fetched successfully ${retries === 0 ? "on first attempt" : `on attempt ${retries}`}`);
        break; // Break out of the retry loop if successful
      } catch (error) {
        retries++;
        console.error(`Failed to fetch all commits on attempt ${retries}. Retrying ...`);
        continue;
      }
    }

    if (!commits) {
      return NextResponse.json({ error: "Failed to fetch commits after multiple attempts" }, { status: 500 });
    }

    return NextResponse.json(commits, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
