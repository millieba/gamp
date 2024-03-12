import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";
import { getPreferencesFromDB, savePreferencesToDB } from "./preferenceService";

export const GET = async () => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const preferences = await getPreferencesFromDB(session.user.githubAccountId);
    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error("An error occurred while getting preferences from the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user.githubAccountId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { excludeLanguages, showStrictStreak, showWorkdayStreak } = await req.json();

    if (
      // Validate request body (could probably use a library like Zod this instead of manual checks. Overkill for now though)
      !Array.isArray(excludeLanguages) ||
      !excludeLanguages.every((lang) => typeof lang === "string") ||
      typeof showStrictStreak !== "boolean" ||
      typeof showWorkdayStreak !== "boolean"
    ) {
      console.error("Invalid request body:", {
        excludeLanguages: {
          value: excludeLanguages,
          type: Array.isArray(excludeLanguages) // If we have an array, log whether it contains non-strings or not
            ? excludeLanguages.some((lang: unknown) => typeof lang !== "string")
              ? "array containing non-strings"
              : "array of strings"
            : typeof excludeLanguages, // If we don't have an array, log the type as is
          expected: "array of strings",
        },
        showStrictStreak: {
          value: showStrictStreak,
          type: typeof showStrictStreak,
          expected: "boolean",
        },
        showWorkdayStreak: {
          value: showWorkdayStreak,
          type: typeof showWorkdayStreak,
          expected: "boolean",
        },
      });
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const updatedPreferences = await savePreferencesToDB(session.user.githubAccountId, {
      excludeLanguages,
      showStrictStreak,
      showWorkdayStreak,
    });

    return NextResponse.json(updatedPreferences, { status: 200 });
  } catch (error) {
    console.error("An error occurred while updating preferences in the database:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
