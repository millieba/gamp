import { Commit } from "@/app/api/commits/commitsService";
import {
  getCommitDatesSet,
  getHistoricalStrictStreak,
  getHistoricalWorkdayStreak,
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

describe("Testing getHistoricalWorkdayStreak", () => {
  it("should return 0 if there are no commits", () => {
    const mockCommits = getCommitDatesSet([]);

    const expectedStreakLength = 0;
    const actualStreakLength = getHistoricalWorkdayStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the longest workday streak correctly, streak should not break even with gaps during weekend", () => {
    const expectedStreakLength = 3;
    const mockCommitsWithGaps = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-19T12:00:00Z"), 8, [0, 3, 4, 6])
    );

    const actualStreakLength = getHistoricalWorkdayStreak(mockCommitsWithGaps).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should not count weekends towards the streak, but not break the streak if there is a gap during the weekend either", () => {
    const expectedStreakLength = 5;
    const mockCommitsWithoutWeekendGaps = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-18T12:00:00Z"), 7, [])
    );

    const actualStreakLength = getHistoricalWorkdayStreak(mockCommitsWithoutWeekendGaps).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the correct workday streak even if commits start on a weekend", () => {
    const expectedStreakLength = 5;
    const mockCommitsStartingOnWeekend = getCommitDatesSet(
      generateMockCommits(new Date("2024-03-23T12:00:00Z"), 7, [])
    );

    const actualStreakLength = getHistoricalWorkdayStreak(mockCommitsStartingOnWeekend).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the oldest streak if there are multiple streaks of the same length", () => {
    const newestStreakOfLength5 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 7, []);
    const oldestStreakOfLength5 = generateMockCommits(new Date("2024-03-12T12:00:00Z"), 7, []);
    const mockCommits = getCommitDatesSet(newestStreakOfLength5.concat(oldestStreakOfLength5));

    const expectedStreakLength = 5;
    const expectedDayList = ["2024-03-12", "2024-03-11", "2024-03-08", "2024-03-07", "2024-03-06"];

    const actualStreak = getHistoricalWorkdayStreak(mockCommits);
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
    const actualStreakLength = getHistoricalWorkdayStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("if a threshold is provided, the first instance (oldest) of a streak that meets or exceeds the threshold should be returned", () => {
    const shortStreak1 = generateMockCommits(new Date("2024-03-23T12:00:00Z"), 3, []); // Expected length: 2
    const mediumStreak = generateMockCommits(new Date("2024-03-17T12:00:00Z"), 5, []); // Expected length: 3
    const longStreak = generateMockCommits(new Date("2024-03-08T12:00:00Z"), 7, []); // Expected length: 5
    const shortStreak2 = generateMockCommits(new Date("2024-02-28T12:00:00Z"), 3, []); // Expected length: 3
    const mockCommits = getCommitDatesSet(shortStreak1.concat(mediumStreak).concat(longStreak).concat(shortStreak2));

    const threshold = 2;
    const expectedStreakLength = 2;
    const expectedDayList = ["2024-02-27", "2024-02-26"];

    const actualStreak = getHistoricalWorkdayStreak(mockCommits, threshold);
    const actualStreakLength = actualStreak.streakLength;
    const actualDayList = actualStreak.streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualDayList).toEqual(expectedDayList);
  });
});

describe("Testing getHistoricalStrictStreak", () => {
  it("should return 0 if there are no commits", () => {
    const mockCommits = getCommitDatesSet([]);

    const expectedStreakLength = 0;
    const actualStreakLength = getHistoricalStrictStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return the longest strict streak correctly, streak should break if there is a gap", () => {
    const expectedStreakLength = 3;
    const mockCommitsWithGaps = getCommitDatesSet(generateMockCommits(new Date("2024-03-22T12:00:00Z"), 7, [1, 2]));

    const actualStreakLength = getHistoricalStrictStreak(mockCommitsWithGaps).streakLength;

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

    const actualStreak = getHistoricalStrictStreak(mockCommits);
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
    const actualStreakLength = getHistoricalStrictStreak(mockCommits).streakLength;

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should return a streak meeting the threshold, even if that streak was made yesterday", () => {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const longestStreakFromToday = generateMockCommits(yesterday, 28, [0, 6]); // Expected length: 21
    const otherShorterStreak = generateMockCommits(new Date("2024-01-01T12:00:00Z"), 3, []); // Expected length: 3

    const mockCommits = getCommitDatesSet(longestStreakFromToday.concat(otherShorterStreak));

    const threshold = 20;
    const expectedStreakLength = 20;
    const expectedDayList = Array.from(getCommitDatesSet(longestStreakFromToday));

    const actualStreak = getHistoricalWorkdayStreak(mockCommits, threshold);
    const actualStreakLength = actualStreak.streakLength;
    const actualDayList = actualStreak.streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualDayList).toEqual(expectedDayList);
  });

  it("testing Karen's case", () => {
    const mockCommitDateSet = new Set<string>([
      "2024-03-25",
      "2024-03-22",
      "2024-03-21",
      "2024-03-20",
      "2024-03-19",
      "2024-03-18",
      "2024-03-15",
      "2024-03-14",
      "2024-03-13",
      "2024-03-12",
      "2024-03-11",
      "2024-03-10",
      "2024-03-08",
      "2024-03-07",
      "2024-03-06",
      "2024-03-05",
      "2024-03-04",
      "2024-03-01",
      "2024-02-29",
      "2024-02-28",
      "2024-02-27",
      "2024-02-26",
      "2024-02-23",
      "2024-02-22",
    ]); // Actual workday streak is 23, but with threshold 20 it should be recognised as 20

    const threshold = 20;
    const expectedStreakLength = 20;
    // const expectedDayList = mockCommitDateSet.delete("2024-03-10");
    const expectedDaysSet = mockCommitDateSet;
    expectedDaysSet.delete("2024-03-10"); // This is a Sunday and should not be counted towards the workday streak
    expectedDaysSet.delete("2024-03-25"); // These last 3 days are day 21, 22 and 23 of the streak, and are not returned as they are above the threshold
    expectedDaysSet.delete("2024-03-22");
    expectedDaysSet.delete("2024-03-21");
    const expectedDays = Array.from(expectedDaysSet);

    const actualStreakLength = getHistoricalWorkdayStreak(mockCommitDateSet, threshold).streakLength;
    const actualdays = getHistoricalWorkdayStreak(mockCommitDateSet, threshold).streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualdays).toEqual(expectedDays);
  });
  it("testing extended version of Karen's case", () => {
    const mockCommitDateSet = new Set<string>([
      "2024-03-25",
      "2024-03-22",
      "2024-03-21",
      "2024-03-20",
      "2024-03-19",
      "2024-03-18",
      "2024-03-15",
      "2024-03-14",
      "2024-03-13",
      "2024-03-12",
      "2024-03-11",
      "2024-03-10",
      "2024-03-08",
      "2024-03-07",
      "2024-03-06",
      "2024-03-05",
      "2024-03-04",
      "2024-03-01",
      "2024-02-29",
      "2024-02-28",
      "2024-02-27",
      "2024-02-26",
      "2024-02-23",
      "2024-02-22",
      "2024-02-20",
      "2024-02-19",
      "2024-02-16",
      "2024-02-15",
      "2024-02-14",
      "2024-02-13",
      "2024-02-12",
      "2024-02-07",
      "2024-02-06",
      "2024-02-05",
      "2024-02-01",
      "2024-01-31",
      "2024-01-30",
      "2024-01-29",
      "2024-01-26",
      "2024-01-25",
      "2024-01-24",
      "2024-01-23",
      "2024-01-22",
      "2024-01-19",
      "2024-01-18",
      "2024-01-16",
      "2024-01-15",
      "2024-01-10",
      "2023-12-07",
      "2023-12-06",
      "2023-12-05",
      "2023-11-21",
      "2023-11-15",
      "2023-11-12",
      "2023-11-11",
      "2023-11-10",
      "2023-11-09",
      "2023-11-08",
      "2023-11-07",
      "2023-11-05",
      "2023-11-04",
      "2023-11-03",
      "2023-11-02",
      "2023-10-31",
      "2023-10-29",
      "2023-10-27",
      "2023-10-26",
      "2023-10-24",
      "2023-10-16",
      "2023-10-11",
      "2023-10-10",
      "2023-10-09",
      "2023-10-06",
      "2023-10-05",
      "2023-10-04",
      "2023-09-29",
      "2023-09-26",
      "2023-09-18",
      "2023-09-17",
      "2023-09-15",
      "2023-09-13",
      "2023-09-01",
      "2023-04-25",
      "2023-04-17",
      "2023-04-16",
      "2023-04-14",
      "2023-04-12",
      "2023-03-29",
      "2023-03-28",
      "2023-03-26",
      "2023-03-24",
      "2023-03-23",
      "2023-03-22",
      "2023-03-20",
      "2023-03-17",
      "2023-03-16",
      "2023-03-15",
      "2023-03-14",
      "2023-03-13",
      "2023-03-07",
      "2023-02-10",
      "2023-01-30",
      "2023-01-17",
      "2022-11-23",
      "2022-11-21",
      "2022-11-20",
      "2022-11-17",
      "2022-11-16",
      "2022-11-15",
      "2022-11-14",
      "2022-11-13",
      "2022-11-08",
      "2022-11-07",
      "2022-11-01",
      "2022-10-31",
      "2022-10-30",
      "2022-10-29",
      "2022-10-28",
      "2022-10-27",
      "2022-10-26",
      "2022-10-25",
      "2022-10-24",
      "2022-10-23",
      "2022-10-21",
      "2022-10-20",
      "2022-10-19",
      "2022-10-18",
      "2022-10-17",
      "2022-10-16",
      "2022-10-13",
      "2022-10-12",
      "2022-10-11",
      "2022-10-06",
      "2022-10-04",
      "2022-10-03",
      "2022-10-02",
      "2022-10-01",
      "2022-09-30",
      "2022-09-29",
      "2022-09-28",
      "2022-09-27",
      "2022-09-26",
      "2022-09-24",
      "2022-09-23",
      "2022-09-22",
      "2022-09-21",
      "2022-09-20",
      "2022-09-16",
      "2021-04-30",
      "2021-04-26",
      "2021-04-24",
      "2021-04-20",
      "2021-04-14",
      "2021-04-13",
      "2021-04-09",
      "2021-03-26",
      "2021-03-25",
      "2021-03-24",
      "2021-03-23",
      "2021-03-17",
      "2021-03-16",
      "2021-03-12",
      "2021-03-08",
      "2020-02-27",
    ]); // Actual workday streak is 23, but with threshold 20 it should be recognised as 20

    const threshold = 20;
    const expectedStreakLength = 20;
    const expectedDays = [
      "2024-03-20",
      "2024-03-19",
      "2024-03-18",
      "2024-03-15",
      "2024-03-14",
      "2024-03-13",
      "2024-03-12",
      "2024-03-11",
      "2024-03-08",
      "2024-03-07",
      "2024-03-06",
      "2024-03-05",
      "2024-03-04",
      "2024-03-01",
      "2024-02-29",
      "2024-02-28",
      "2024-02-27",
      "2024-02-26",
      "2024-02-23",
      "2024-02-22",
    ];

    const actualStreakLength = getHistoricalWorkdayStreak(mockCommitDateSet, threshold).streakLength;
    const actualdays = getHistoricalWorkdayStreak(mockCommitDateSet, threshold).streakDates;

    expect(actualStreakLength).toEqual(expectedStreakLength);
    expect(actualdays).toEqual(expectedDays);
  });
});
