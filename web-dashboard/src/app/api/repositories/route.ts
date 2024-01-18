import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prisma from "@/utils/prisma";
import { isAuthenticated } from "@/utils/auth";
import { Session } from "next-auth";

export const GET = async (request: Request) => {
  const session = await isAuthenticated();

  return session.authenticated
    ? await fetchRepos(session.session)
    : NextResponse.redirect(`${process.env.NEXTAUTH_URL}/api/auth/signin`);
};

async function fetchRepos(session: Session | null) {
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
}