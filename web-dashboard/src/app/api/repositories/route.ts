import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { PrismaClient } from '@prisma/client';

export const GET = async () => {
  const prisma = new PrismaClient();
  const accounts = await prisma.account.findMany();

  const octokit = new Octokit({
    auth: accounts[0].access_token,
  });

  try {
    const repos = await octokit.request("GET /user/{owner}/repos", {
      owner: accounts[0].providerAccountId,
    });
    return NextResponse.json({ repos: repos }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};