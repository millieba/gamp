import prisma from "@/utils/prisma";

export async function getLoggedInAccount(accountId: string) {
    try {
        const loggedInAccount = await prisma.account.findUnique({
            where: { id: accountId, provider: "github" },
        });
        return loggedInAccount;
    } catch (error) {
        const errorMessage = `An error occurred while getting the logged in account: ${(error as Error).message}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}