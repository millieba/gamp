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

function getStreakCandidates(commits: Commit[]): string[] {
  const commitDates = new Set<string>();

  for (let i = 0; i < commits.length; i++) {
    const currentCommit = commits[i];
    const currentDate = new Date(currentCommit.committedDate);
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    if (i === 0) {
      commitDates.add(currentCommit.committedDate.split("T")[0]);
    } else {
      const previousCommit = commits[i - 1];
      const previousDate = new Date(previousCommit.committedDate);
      const previousDay = previousDate.getDay();

      const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      console.log("curr", currentDate, "prev", previousDate);

      if (dayDiff > 1) {
        if (
          (currentDay === 1 && (previousDay === 5 || previousDay === 6)) || // Gap with Friday/Saturday on one side, Monday on other
          (previousDay === 1 && (currentDay === 5 || currentDay === 6))
        ) {
          console.log("Added even if", "curr", currentDate, currentDay, "prev", previousDate, previousDay);
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

function calculateStrictStreak(commitDates: string[]): {
  strictStreak: number;
  strictTodayNeeded: boolean;
  strictStreakToContinue: number | null;
} {
  let strictStreak = 0;
  let strictTodayNeeded = false;
  let strictStreakToContinue = null;

  const today = new Date();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  const dateSet = new Set<string>(commitDates);
  const mostRecentDate = new Date(commitDates[0]);

  if (mostRecentDate.toDateString() === today.toDateString()) {
    // If today has a commit
    strictTodayNeeded = false;
    let currentDate = new Date(today);
    while (dateSet.has(currentDate.toISOString().split("T")[0])) {
      strictStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  } else if (mostRecentDate.toDateString() === yesterday.toDateString()) {
    // If today has no commit, but yesterday has a commit
    strictTodayNeeded = true;
    let currentDate = new Date(yesterday);
    while (dateSet.has(currentDate.toISOString().split("T")[0])) {
      strictStreakToContinue = strictStreakToContinue === null ? 1 : strictStreakToContinue + 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return { strictStreak, strictTodayNeeded, strictStreakToContinue };
}

function calculateWorkdayStreak(commitDates: string[]): {
  workdayStreak: number;
  workdayTodayNeeded: boolean;
  workdayStreakToContinue: number | null;
} {
  let workdayStreak = 0;
  let workdayTodayNeeded = false;
  let workdayStreakToContinue = null;

  const mostRecentDate = new Date(commitDates[0]);
  const today = new Date();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  if (mostRecentDate.toDateString() === today.toDateString()) {
    // If today has a commit
    workdayTodayNeeded = false;
    workdayStreak = commitDates.length; // This is safe as commitDates only contain unique consecutive-ish days (gaps during weekends are allowed)
  } else if (mostRecentDate.toDateString() === yesterday.toDateString()) {
    // If today has no commit, but yesterday has a commit
    workdayTodayNeeded = true;
    workdayStreakToContinue = commitDates.length;
  }

  return { workdayStreak, workdayTodayNeeded, workdayStreakToContinue };
}

export interface StreakResponse {
  workdayStreak: number;
  workdayTodayNeeded: boolean;
  workdayStreakToContinue: number | null;
  strictStreak: number;
  strictTodayNeeded: boolean;
  strictStreakToContinue: number | null;
}

export function getCommitStreak(commits: Commit[]): StreakResponse {
  //   const commitDates = getStreakCandidates(
  //     generateMockCommits(new Date(new Date().setDate(new Date().getDate())), 8, [0, 6])
  //   );

  const commitDates = getStreakCandidates(commits);
  console.log(commitDates);

  if (!commitDates || commitDates.length === 0) {
    return {
      workdayStreak: 0,
      workdayTodayNeeded: false,
      workdayStreakToContinue: null,
      strictStreak: 0,
      strictTodayNeeded: false,
      strictStreakToContinue: null,
    };
  }
  const { strictStreak, strictTodayNeeded, strictStreakToContinue } = calculateStrictStreak(commitDates);
  const { workdayStreak, workdayTodayNeeded, workdayStreakToContinue } = calculateWorkdayStreak(commitDates);

  return {
    workdayStreak,
    workdayTodayNeeded,
    workdayStreakToContinue,
    strictStreak,
    strictTodayNeeded,
    strictStreakToContinue,
  };
}
