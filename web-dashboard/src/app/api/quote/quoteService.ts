import prisma from "@/utils/prisma";
import { TooManyRequestsError } from "../sync/syncService";

const isLastSyncToday = (lastSync: Date) => new Date().setUTCHours(0, 0, 0, 0) === lastSync.setUTCHours(0, 0, 0, 0);

export async function getTodaysQuote(accountId: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { lastSync: true, lastQuoteId: true, quote: { select: { text: true, source: true, type: true } } },
    });

    // If the account doesn't have a quote or the last sync was not today, fetch a new quote
    if (!account?.quote || (account?.lastSync && !isLastSyncToday(account.lastSync))) {
      let newQuote = await getRandomQuote(account?.lastQuoteId || undefined);
      const quote = newQuote && (await updateQuote(accountId, newQuote?.id));
      return quote?.quote;
    }

    return account?.quote;
  } catch (error) {
    console.error("An error occurred while fetching today's random quote:", error);
    throw error;
  }
}

// Helper function to connect a quote to an account and either increment the skipped quotes count or reset it
export async function updateQuote(accountId: string, quoteId: string, isSkipUpdate = false) {
  try {
    const quote = await prisma.account.update({
      where: { id: accountId },
      data: {
        skippedQuotes: isSkipUpdate ? { increment: 1 } : { set: 0 },
        quote: { connect: { id: quoteId } },
      },
      select: { quote: { select: { text: true, source: true, type: true } } },
    });

    return quote;
  } catch (error) {
    console.error("An error occurred while updating today's quote:", error);
    throw error;
  }
}

export async function skipQuote(accountId: string) {
  try {
    let account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        skippedQuotes: true,
        lastQuoteId: true,
        lastSync: true,
        quote: { select: { text: true, source: true, type: true } },
      },
    });

    if (!account) throw new Error(`Account with id ${accountId} not found`);

    // If the last sync was not today, reset the skipped quotes count and re-fetch the account
    if (account?.lastSync && !isLastSyncToday(account.lastSync)) {
      account = await prisma.account.update({
        where: { id: accountId },
        data: { skippedQuotes: 0 },
        select: {
          skippedQuotes: true,
          lastQuoteId: true,
          lastSync: true,
          quote: { select: { text: true, source: true, type: true } },
        },
      });
    }

    // If the user has already skipped 3 quotes today, throw an error
    if (account?.skippedQuotes >= 3) {
      const tomorrow = new Date();
      tomorrow.setUTCHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      throw new TooManyRequestsError(
        `You've already skipped 3 quotes today. Please come back tomorrow for a new quote!`,
        tomorrow.getTime()
      );
    }

    let newQuote = await getRandomQuote(account?.lastQuoteId || undefined);
    const quote = newQuote && (await updateQuote(accountId, newQuote?.id, true));

    return quote?.quote;
  } catch (error) {
    console.error("An error occurred while skipping today's quote:", error);
    throw error;
  }
}

// Helper function to fetch a random quote from the database, will not return the quote with the provided excludeId
// This helps us avoid showing the same quote to the user twice in a row
export async function getRandomQuote(excludeId?: string) {
  try {
    let count = await prisma.quote.count();
    if (excludeId) count--; // Adjusting the count as we're excluding a quote if excludeId is provided

    const randomIndex = Math.floor(Math.random() * count);
    return await prisma.quote.findFirst({ skip: randomIndex, where: { id: { not: excludeId } } });
  } catch (error) {
    console.error("An error occurred while fetching a random quote:", error);
    throw error;
  }
}
