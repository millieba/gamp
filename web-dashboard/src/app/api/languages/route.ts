import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { languagesServices } from "./languagesService";

export const GET = async () => {
  const session = await getServerSession(options);

  if (!session || !session.user.githubAccountId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const languages = await languagesServices(session.user.githubAccountId);
    return NextResponse.json(languages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
