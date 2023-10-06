import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export const GET = async () => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_AUTH_TOKEN,
  });

  try {
    const commits = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner: "karenvi",
      repo: "it3023-statistics"
    });

    return NextResponse.json({ commits }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};


