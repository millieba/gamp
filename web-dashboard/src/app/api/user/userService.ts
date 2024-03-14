import prisma from "@/utils/prisma";

export async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User ${userId} has been deleted:`, user);

    return user;
  } catch (error) {
    console.error(`An error occurred while deleting user ${userId} from the database:`, error);
    throw error;
  }
}

export async function deleteGitHubAppAuthorization(accountId: string) {
  try {
    const clientId = process.env.GITHUB_ID as string;
    const clientSecret = process.env.GITHUB_SECRET as string;
    const apiUrl = `https://api.github.com/applications/${clientId}/grant`;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { access_token: true },
    });

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: account?.access_token,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to delete token from GitHub. Status: ${response.status}, ${response.statusText}`);
      throw new Error("Failed to delete token from GitHub");
    } else {
      console.log("Token deleted successfully!");
    }
  } catch (error) {
    console.error(`An error occurred while deleting GitHub app authorization for account id ${accountId}`, error);
    throw error;
  }
}
