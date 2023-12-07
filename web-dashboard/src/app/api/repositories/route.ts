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

  const loggedInAccount = await prisma.user.findUnique({
    where: { email: session?.user?.email },
    include: {
      accounts: {
        where: { provider: 'github' }, // Only include accounts where provider is 'github'
      }
    },
  });

  const octokit = new Octokit({
    auth: loggedInAccount?.accounts[0].access_token // We can safely assume that the first account is the GitHub account, since we filtered for it in the query above
  });

  try {
    const repos = await octokit.request("GET /user/{owner}/repos", {
      owner: loggedInAccount?.accounts[0].providerAccountId,
    });
    return NextResponse.json({ repos: repos }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};