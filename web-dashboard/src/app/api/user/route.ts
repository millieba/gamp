import { NextRequest, NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { deleteGitHubAppAuthorization, deleteUser } from "./userService";
import { getServerSession } from "next-auth";

export const DELETE = async (req: NextRequest) => {
  try {
    const session = await getServerSession({ req, ...options });
    if (!session || !session.user || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    if (req.method !== "DELETE") {
      return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
    }
    const userId = await req.json();

    if (typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Check if the user ID in the session matches the ID of the user being deleted (users should only be able to delete their own user)
    if (session.user.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Revoke GitHub app authorization, then delete the user from the database
    await deleteGitHubAppAuthorization(session.user.githubAccountId);
    const deletedUser = await deleteUser(userId);

    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    console.error("An error occurred while deleting user from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
