import { Commit } from "../commitsService";

export function generateMockCommits(startDate: Date, daysBack: number, skipDays: number[]): Commit[] {
  const mockCommits: Commit[] = [];

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - i);

    // Check if the current day should be skipped
    if (skipDays.includes(date.getDay())) {
      continue; // Skip this day
    }

    const commit: Commit = {
      message: `Commit for ${date.toLocaleDateString("en-US", { weekday: "long" })}`,
      oid: i.toString(),
      additions: Math.floor(Math.random() * 200) + 50,
      deletions: Math.floor(Math.random() * 100) + 20,
      changedFilesIfAvailable: Math.floor(Math.random() * 6) + 1,
      author: {
        email: "author@example.com",
      },
      committedDate: date.toISOString(),
    };

    mockCommits.push(commit);
  }

  return mockCommits;
}

// Returns all unique dates the user has committed in a row, with the exception that gaps during weekends are allowed.
function getStreakCandidates(commits: Commit[]): string[] {
  const commitDates = new Set<string>();

  for (let i = 0; i < commits.length; i++) {
    const currentCommit = commits[i];
    const currentDate = new Date(currentCommit.committedDate);
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    if (i === 0) {
      commitDates.add(currentCommit.committedDate.split("T")[0]);
    } else {
      const previousCommit = commits[i - 1]; // More recent than currentCommit (commits are sorted new to old)
      const previousDate = new Date(previousCommit.committedDate);
      const previousDay = previousDate.getDay();

      const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24); // Get difference in days between two commits

      if (dayDiff > 1) {
        if (
          // If gap is during the weekend, i.e. Monday(1) on one side, and Friday/Saturday(5/6) on the other
          (currentDay === 1 && (previousDay === 5 || previousDay === 6)) ||
          (previousDay === 1 && (currentDay === 5 || currentDay === 6))
        ) {
          commitDates.add(currentCommit.committedDate.split("T")[0]);
          commitDates.add(previousCommit.committedDate.split("T")[0]);
        } else {
          break; // Break the loop if the gap is not during the weekend
        }
      } else {
        commitDates.add(currentCommit.committedDate.split("T")[0]);
      }
    }
  }
  return Array.from(commitDates);
}

// Calculates the strict streak, meaning how many days in a row the user has committed.
// Any gap will break the strict streak, even if the gap is during the weekend.
function calculateStrictStreak(commitDates: string[]): {
  strictStreak: number | null;
  strictStreakToContinue: number | null;
} {
  let strictStreak = null;
  let strictStreakToContinue = null;

  const today = new Date();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  const dateSet = new Set<string>(commitDates);
  const mostRecentDate = new Date(commitDates[0]);

  if (mostRecentDate.toDateString() === today.toDateString()) {
    // If today has a commit, the user can keep their streak without needing to commit
    let currentDate = new Date(today);
    while (dateSet.has(currentDate.toISOString().split("T")[0])) {
      strictStreak = strictStreak === null ? 1 : strictStreak + 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  } else if (mostRecentDate.toDateString() === yesterday.toDateString()) {
    // If today has no commit, but yesterday has a commit, the user needs to commit today to continue yesterday's streak
    let currentDate = new Date(yesterday);
    while (dateSet.has(currentDate.toISOString().split("T")[0])) {
      // Get yesterday's streak as the strict streak to continue
      strictStreakToContinue = strictStreakToContinue === null ? 1 : strictStreakToContinue + 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return { strictStreak, strictStreakToContinue };
}

// The workday streak allows the user to keep their streak even if there are no commits during the weekend
// E.g. commits on wednesday, thursday, friday, and monday gives streak 4, not 1.
function calculateWorkdayStreak(commitDates: string[]): {
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
} {
  let workdayStreak = null;
  let workdayStreakToContinue = null;

  const mostRecentDate = new Date(commitDates[0]);
  const today = new Date();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  if (mostRecentDate.toDateString() === today.toDateString()) {
    // If today has a commit, we know that the length of commitDates is equal to the workday streak
    // as commitDates was created by only adding unique, consecutive commit days with the exception of weekends
    workdayStreak = commitDates.length;
  } else if (mostRecentDate.toDateString() === yesterday.toDateString()) {
    // If today has no commit, but yesterday has a commit, the user needs to commit today to keep yesterday's streak
    workdayStreakToContinue = commitDates.length;
  }

  return { workdayStreak, workdayStreakToContinue };
}

export interface StreakResponse {
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
  strictStreak: number | null;
  strictStreakToContinue: number | null;
}

export function getCommitStreak(commits: Commit[]): StreakResponse {
  try {
    const commitDates = getStreakCandidates(
      generateMockCommits(new Date(new Date().setDate(new Date().getDate())), 8, [0, 6])
    );

    //   const commitDates = getStreakCandidates(commits);
    console.log(commitDates);

    const { strictStreak, strictStreakToContinue } = calculateStrictStreak(commitDates);
    const { workdayStreak, workdayStreakToContinue } = calculateWorkdayStreak(commitDates);

    return {
      workdayStreak,
      workdayStreakToContinue,
      strictStreak,
      strictStreakToContinue,
    };
  } catch (error) {
    console.error("Failed to calculate commits streak.", error);
    throw error;
  }
}
