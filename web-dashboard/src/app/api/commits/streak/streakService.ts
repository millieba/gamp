import { th } from "date-fns/locale";
import { Commit } from "../commitsService";

// Returns all unique dates the user has committed in a row, with the exception that gaps during weekends are allowed.
function getStreakCandidates(commits: Commit[]): Set<string> {
  const commitDates = new Set<string>();

  for (let i = 0; i < commits.length; i++) {
    const currentCommit = commits[i];
    const currentDate = new Date(currentCommit.committedDate);
    currentDate.setUTCHours(0, 0, 0, 0);
    const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    if (i === 0) {
      commitDates.add(currentCommit.committedDate.split("T")[0]);
    } else {
      const previousCommit = commits[i - 1]; // More recent than currentCommit (commits are sorted new to old)
      const previousDate = new Date(previousCommit.committedDate);
      previousDate.setUTCHours(0, 0, 0, 0);
      const previousDay = previousDate.getDay();

      const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24); // Get difference in days between two commits

      if (dayDiff > 1) {
        if (
          // If gap is during the weekend, i.e. Sunday/Monday(0/1) on one side, and Friday/Saturday(5/6) on the other
          (previousDay === 0 || previousDay === 1) &&
          (currentDay === 5 || currentDay === 6)
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
  return commitDates;
}

// Calculates the strict streak, meaning how many days in a row the user has committed.
// Any gap will break the strict streak, even if the gap is during the weekend.
function calculateStrictStreak(commitDates: Set<string>): {
  strictStreak: number | null;
  strictStreakToContinue: number | null;
} {
  let strictStreak = null;
  let strictStreakToContinue = null;

  const today = new Date();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  const mostRecentDate = new Date(commitDates.values().next().value); // First (most recent) element in set. https://stackoverflow.com/a/72857508

  if (mostRecentDate.toDateString() === today.toDateString()) {
    // If today has a commit, the user has a streak
    let currentDate = new Date(today);
    while (commitDates.has(currentDate.toISOString().split("T")[0])) {
      strictStreak = strictStreak === null ? 1 : strictStreak + 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  } else if (mostRecentDate.toDateString() === yesterday.toDateString()) {
    // If today has no commit, but yesterday has a commit, the user needs to commit today to continue yesterday's streak
    let currentDate = new Date(yesterday);
    while (commitDates.has(currentDate.toISOString().split("T")[0])) {
      // Get yesterday's streak as the strict streak to continue
      strictStreakToContinue = strictStreakToContinue === null ? 1 : strictStreakToContinue + 1;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  }

  return { strictStreak, strictStreakToContinue };
}

// The workday streak allows the user to keep their streak even if there are no commits during the weekend
// E.g. commits on wednesday, thursday, friday, and monday gives streak 4, not 1.
function calculateWorkdayStreak(commitDates: Set<string>): {
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
} {
  let workdayStreak = null;
  let workdayStreakToContinue = null;

  const today = new Date();
  const todayDay = today.getDay();
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));

  const mostRecentDate = new Date(commitDates.values().next().value);
  const mostRecentDay = mostRecentDate.getDay();

  const dayDiff = (today.setUTCHours(0, 0, 0, 0) - mostRecentDate.setUTCHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24);

  if (
    mostRecentDate.toDateString() === today.toDateString() || // If today has a commit,
    (dayDiff < 7 && // or if most recent commit is within this week
      (mostRecentDay === 5 || mostRecentDay === 6) && // and most recent commit day was on friday/saturday
      (todayDay === 6 || todayDay === 0)) // and today is the weekend,
  ) {
    workdayStreak = countWorkdays(commitDates); // set the streak to number of workdays in the commitDates set.
  } else if (
    mostRecentDate.toDateString() === yesterday.toDateString() || // If yesterday has a streak to be continued,
    (today.getDay() === 1 && dayDiff <= 3) // or if today is Monday and most recent commit was up to 3 days ago (Friday or later),
  ) {
    workdayStreakToContinue = countWorkdays(commitDates); // there is a streak that can be continued if the user commits today
  }

  return { workdayStreak, workdayStreakToContinue };
}

// Helper function to count workdays
function countWorkdays(commitDates: Set<string>): number {
  let count = 0;

  commitDates.forEach((dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    if (day !== 6 && day !== 0) {
      // Count all days with commits except Saturday and Sunday
      count++;
    }
  });

  return count;
}

export interface StreakResponse {
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
  strictStreak: number | null;
  strictStreakToContinue: number | null;
}

export function getCommitStreak(commits: Commit[]): StreakResponse {
  try {
    const commitDates = getStreakCandidates(commits);

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

export function getCommitDatesSet(commits: Commit[]): Set<string> {
  return new Set(commits.map((commit) => commit.committedDate.split("T")[0])); // Extracting only the date part
}

// Function for finding the all-time longest strict streak, or the oldest strict streak the reached a given threshold
export function getHistoricalStrictStreak(
  commitDates: Set<string>,
  threshold?: number
): { streakLength: number; streakDates: string[] } {
  let longestStreak = 0;
  let currentStreak = 0;
  let longestStreakDates: string[] = [];
  let currentStreakDates: string[] = [];
  let previousDate: Date | undefined = undefined;

  // Utility functions
  const isConsecutive = (currentDate: Date, previousDate: Date | undefined): boolean => {
    const dayDiff =
      ((previousDate?.setUTCHours(0, 0, 0, 0) ?? currentDate.setUTCHours(0, 0, 0, 0)) -
        currentDate.setUTCHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);
    // If there is no previous date, we are on the first iteration, or if the day difference is 1, we have a consecutive day
    return !previousDate || dayDiff === 1;
  };

  const updateStreak = (): void => {
    if (threshold && currentStreak >= threshold) {
      longestStreak = threshold; // Set streak to threshold, it is irrelevant if the current streak is longer than the threshold
      longestStreakDates = currentStreakDates.slice(-threshold); // Remove any commit dates that happened after the threshold was reached
    } else if (currentStreak >= longestStreak) {
      // Update streak if current streak is longer than the longest streak
      longestStreak = currentStreak;
      longestStreakDates = [...currentStreakDates];
    }
  };

  commitDates.forEach((date) => {
    const currentDate = new Date(date);

    if (isConsecutive(currentDate, previousDate)) {
      currentStreak++;
      currentStreakDates.push(date);
    } else {
      updateStreak(); // If not consecutive, update streak and reset streak + streak dates
      currentStreak = 1;
      currentStreakDates = [date];
    }
    previousDate = currentDate;
  });

  updateStreak(); // In case we never reached the else block, update streak at the end

  return { streakLength: longestStreak, streakDates: longestStreakDates };
}

// Function for finding the all-time longest workday streak, or the oldest workday streak the reached a given threshold
export function getHistoricalWorkdayStreak(
  commitDates: Set<string>,
  threshold?: number
): { streakLength: number; streakDates: string[] } {
  let longestStreak = 0;
  let currentStreak = 0;
  let longestStreakDates: string[] = [];
  let currentStreakDates: string[] = [];
  let previousDate: Date | undefined = undefined;

  // Utility functions
  const isConsecutive = (currentDate: Date, previousDate: Date | undefined): boolean => {
    const dayDiff =
      ((previousDate?.setUTCHours(0, 0, 0, 0) ?? currentDate.setUTCHours(0, 0, 0, 0)) -
        currentDate.setUTCHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24);
    // If the day difference is 3 and the previous date was a Monday, we have a consecutive workday streak (but with a weekend gap)
    return !previousDate || dayDiff === 1 || (dayDiff <= 3 && previousDate.getDay() === 1);
  };

  const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6; // 0 = Sunday, 6 = Saturday
  };

  const updateStreak = (): void => {
    if (threshold && currentStreak >= threshold) {
      longestStreak = threshold; // Set streak to threshold, it is irrelevant if the current streak is longer than the threshold
      longestStreakDates = currentStreakDates.slice(-threshold); // Remove any commit dates that happened after the threshold was reached
    } else if (currentStreak >= longestStreak) {
      // Update streak if current streak is longer than the longest streak
      longestStreak = currentStreak;
      longestStreakDates = [...currentStreakDates];
    }
  };

  // Loop through all commit dates and look for the longest streak or the oldest streak that reached the threshold
  commitDates.forEach((date) => {
    const currentDate = new Date(date);

    if (isConsecutive(currentDate, previousDate)) {
      if (!isWeekend(currentDate)) {
        currentStreak++; // Only count workdays in the streak
        currentStreakDates.push(date);
      }
    } else {
      updateStreak(); // If not consecutive, update streak and reset streak + streak dates
      currentStreak = 1;
      currentStreakDates = [date];
    }
    previousDate = currentDate;
  });

  updateStreak(); // In case we never reached the else block, update streak at the end

  return { streakLength: longestStreak, streakDates: longestStreakDates };
}
