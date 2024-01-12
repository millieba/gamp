import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

export const GET = async () => {
  const session = await getServerSession(options)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const loggedInAccount = await prisma.account.findFirst({
    where: { userId: session?.user?.userId, provider: "github" },
  });

  const octokit = new Octokit({
    auth: `token ${loggedInAccount?.access_token}`,
  });

  try {
    const repos = await octokit.request("GET /user/repos", {
      owner: loggedInAccount?.providerAccountId,
    });
    return NextResponse.json({ repos: repos }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};