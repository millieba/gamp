import prisma from "@/utils/prisma";
import { TooManyRequestsError } from "../sync/syncService";

const isLastSyncToday = (lastSync: Date) => {
  const today = new Date();
  return lastSync.setUTCHours(0, 0, 0, 0) === today.setUTCHours(0, 0, 0, 0);
};

export async function getTodaysQuote(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        lastSync: true,
        quote: {
          select: { text: true, source: true },
        },
      },
    });

    if (!account?.quote || (account?.lastSync && !isLastSyncToday(account.lastSync))) {
      const newQuote = await getRandomQuote();

      const quote = newQuote && (await updateQuote(accountId, newQuote?.id));
      return quote;
    }

    // If the last sync was today, just return the existing quote
    return { quote: account.quote };
  } catch (error) {
    console.error("An error occurred while fetching today's random quote:", error);
    throw error;
  }
}

export async function updateQuote(accountId: string, quoteId: string, isSkipUpdate = false) {
  try {
    const quote = await prisma.account.update({
      where: { id: accountId },
      data: {
        skippedQuotes: isSkipUpdate ? { increment: 1 } : { set: 0 },
        quote: {
          connect: { id: quoteId },
        },
      },
      select: {
        quote: {
          select: { text: true, source: true },
        },
      },
    });

    return quote;
  } catch (error) {
    console.error("An error occurred while updating today's quote:", error);
    throw error;
  }
}

export async function skipQuote(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { skippedQuotes: true },
    });

    if (!account) throw new Error(`Account with id ${accountId} not found`);

    if (account?.skippedQuotes >= 3) {
      const tomorrow = new Date();
      tomorrow.setUTCHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      throw new TooManyRequestsError(
        `You've already skipped 3 quotes today. Please come back tomorrow for a new quote!`,
        tomorrow.getTime()
      );
    }
    const randomQuote = await getRandomQuote();
    const quote = randomQuote && (await updateQuote(accountId, randomQuote?.id, true));

    return quote;
  } catch (error) {
    console.error("An error occurred while skipping today's quote:", error);
    throw error;
  }
}

export async function getRandomQuote() {
  try {
    const count = await prisma.quote.count();
    const randomIndex = Math.floor(Math.random() * count);
    const quote = await prisma.quote.findFirst({ skip: randomIndex });

    return quote;
  } catch (error) {
    console.error("An error occurred while fetching a random quote:", error);
    throw error;
  }
}
