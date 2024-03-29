import prisma from "@/utils/prisma";

export async function getTodaysQuote(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { lastSync: true, quote: true },
    });

    if (!account?.quote || (account?.lastSync && !isLastSyncToday(account.lastSync))) {
      const count = await prisma.quote.count();
      const randomIndex = Math.floor(Math.random() * count);
      const newQuote = await prisma.quote.findFirst({ skip: randomIndex });

      const quote = await prisma.account.update({
        where: { id: accountId },
        data: {
          quote: {
            connect: { id: newQuote?.id }, // Connect the updated quote to the account
          },
        },
        select: { quote: true },
      });
      return quote;
    }

    // If the last sync was today, just return the existing quote
    const quote = await prisma.account.findUnique({
      where: { id: accountId },
      select: { quote: true },
    });

    return quote;
  } catch (error) {
    console.error("An error occurred while fetching today's random quote:", error);
    throw error;
  }
}

const isLastSyncToday = (lastSync: Date) => {
  const today = new Date();

  return lastSync.setUTCHours(0, 0, 0, 0) === today.setUTCHours(0, 0, 0, 0);
};
