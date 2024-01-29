import prisma from "@/utils/prisma";
import { checkBadges } from "../badges/checkBadgesService";

export class TooManyRequestsError extends Error {
    retryAfter: number;
    constructor(message: string, retryAfter: number) {
        super(message);
        this.name = "TooManyRequestsError";
        this.retryAfter = retryAfter;
    }
}

export async function syncWithGithub(accountId: string) {
    try {
        // console.log("Syncing at time: " + new Date().toISOString());
        const account = await prisma.account.findUnique({ where: { id: accountId } });

        if (!account) throw new Error(`Account with id ${accountId} not found`);

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (account.lastSync && account.lastSync > fiveMinutesAgo) {
            const retryAfter = (account.lastSync.getTime() + 5 * 60 * 1000 - Date.now()) / 1000;
            const timeSinceLastSync = (Date.now() - account.lastSync.getTime()) / 1000;
            throw new TooManyRequestsError(`Last sync was ${timeSinceLastSync.toFixed(0)} seconds ago. Please retry after ${retryAfter.toFixed(0)} seconds.`, retryAfter);
        }

        await checkBadges(accountId);
        // await checkStats(accountId);
        // await checkLevel(accountId);

        await prisma.account.update({ where: { id: accountId }, data: { lastSync: new Date() } });
    } catch (error) {
        if (error instanceof TooManyRequestsError) throw error;
        else throw new Error((error instanceof Error) ? error.message : 'Internal Server Error');
    }
}
