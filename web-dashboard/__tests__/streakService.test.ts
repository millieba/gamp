import { Commit } from "@/app/api/commits/commitsService";
import {
  getCommitDatesSet,
  getLongestStrictStreak,
  getLongestWorkdayStreak,
} from "@/app/api/commits/streak/streakService";
import "@testing-library/jest-dom";

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

describe("Check if commits are sorted new to old", () => {
  it("checking if mock commits are sorted new to old", () => {
    const mockCommits = generateMockCommits(new Date("2024-03-19T12:00:00Z"), 4, []);
    const sortedCommits = mockCommits.sort((a, b) => {
      return new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime();
    });
    expect(sortedCommits).toEqual(mockCommits);
  });
});

describe("Testing getLongestWorkdayStreak", () => {
  it("should return 0 if there are no commits", () => {
    const mockCommits = getCommitDatesSet([]);

    const expectedStreakLength = 0;
    const actualStreakLength = getLongestWorkdayStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the longest workday streak correctly, streak should not break even with gaps during weekend", () => {
    const expectedStreakLength = 3;
    const mockCommitsWithGaps = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-19T12:00:00Z"), 8, [0, 3, 4, 6])
    );

    const actualStreakLength = getLongestWorkdayStreak(mockCommitsWithGaps).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should not count weekends towards the streak, but not break the streak if there is a gap during the weekend either", () => {
    const expectedStreakLength = 5;
    const mockCommitsWithoutWeekendGaps = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-18T12:00:00Z"), 7, [])
    );

    const actualStreakLength = getLongestWorkdayStreak(mockCommitsWithoutWeekendGaps).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the correct workday streak even if commits start on a weekend", () => {
    const expectedStreakLength = 5;
    const mockCommitsStartingOnWeekend = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-23T12:00:00Z"), 7, [])
    );

    const actualStreakLength = getLongestWorkdayStreak(mockCommitsStartingOnWeekend).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the oldest streak if there are multiple streaks of the same length", () => {
    const newestStreakOfLength5 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 7, []);
    const oldestStreakOfLength5 = generateMockCommits(new Date("2024-03-12T12:00:00Z"), 7, []);
    const mockCommits = getCommitDatesSet(newestStreakOfLength5.concat(oldestStreakOfLength5));

    const expectedStreakLength = 5;
    const expectedDayList = ["2024-03-12", "2024-03-11", "2024-03-08", "2024-03-07", "2024-03-06"];

    const actualStreak = getLongestWorkdayStreak(mockCommits);
    const actualStreakLength = actualStreak.streakLength;
    const actualDayList = actualStreak.streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualDayList).toEqual(expectedDayList);
  });

  it("should return the longest commit streak if there are several candidates of different lengths", () => {
    const shortStreak1 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 3, []); // Expected length: 2
    const mediumStreak = generateMockCommits(new Date("2024-03-17T12:00:00Z"), 5, []); // Expected length: 3
    const longStreak = generateMockCommits(new Date("2024-03-08T12:00:00Z"), 7, []); // Expected length: 5
    const shortStreak2 = generateMockCommits(new Date("2024-02-28T12:00:00Z"), 2, []); // Expected length: 2

    const mockCommits = getCommitDatesSet(shortStreak1.concat(mediumStreak).concat(longStreak).concat(shortStreak2));

    const expectedStreakLength = 5;
    const actualStreakLength = getLongestWorkdayStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });
});

describe("Testing getLongestStrictStreak", () => {
  it("should return 0 if there are no commits", () => {
    const mockCommits = getCommitDatesSet([]);

    const expectedStreakLength = 0;
    const actualStreakLength = getLongestStrictStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the longest strict streak correctly, streak should break if there is a gap", () => {
    const expectedStreakLength = 3;
    const mockCommitsWithGaps = getCommitDatesSet(generateMockCommits(new Date("2024-03-22T12:00:00Z"), 7, [1, 2]));

    const actualStreakLength = getLongestStrictStreak(mockCommitsWithGaps).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the oldest streak if there are multiple streaks of the same length", () => {
    const newestStreakOfLength5 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 7, []);
    const oldestStreakOfLength5 = generateMockCommits(new Date("2024-03-12T12:00:00Z"), 7, []);
    const mockCommits = getCommitDatesSet(newestStreakOfLength5.concat(oldestStreakOfLength5));

    const expectedStreakLength = 7;
    const expectedDayList = [
      "2024-03-12",
      "2024-03-11",
      "2024-03-10",
      "2024-03-09",
      "2024-03-08",
      "2024-03-07",
      "2024-03-06",
    ];

    const actualStreak = getLongestStrictStreak(mockCommits);
    const actualStreakLength = actualStreak.streakLength;
    const actualDayList = actualStreak.streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualDayList).toEqual(expectedDayList);
  });

  it("should return the longest commit streak if there are several candidates of different lengths", () => {
    const shortStreak1 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 3, []); // Expected length: 3
    const mediumStreak = generateMockCommits(new Date("2024-03-17T12:00:00Z"), 5, []); // Expected length: 6
    const longStreak = generateMockCommits(new Date("2024-03-08T12:00:00Z"), 7, []); // Expected length: 7
    const shortStreak2 = generateMockCommits(new Date("2024-02-28T12:00:00Z"), 2, []); // Expected length: 2

    const mockCommits = getCommitDatesSet(shortStreak1.concat(mediumStreak).concat(longStreak).concat(shortStreak2));

    const expectedStreakLength = 7;
    const actualStreakLength = getLongestStrictStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });
});
