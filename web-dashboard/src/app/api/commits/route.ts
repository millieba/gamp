import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { prepareCommitsForDB } from "./commitsService";
import { getCommitStreak, getLongestStreak, getLongestWorkdayStreak } from "./streak/streakService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const commits = await prepareCommitsForDB(session.user.githubAccountId);

    const streak = getCommitStreak(commits.commits);
    // const bestStreak = getLongestStreak(commits.commits);
    // const workdayStreak = getLongestWorkdayStreak(commits.commits);

    return NextResponse.json(commits, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
