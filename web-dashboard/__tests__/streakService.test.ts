import { Commit } from "@/app/api/commits/commitsService";
import { getLongestWorkdayStreak } from "@/app/api/commits/streak/streakService";
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
  it("should return true if the commits are sorted new to old", () => {
    const mockCommits = generateMockCommits(new Date("2024-03-19T12:00:00Z"), 4, []);
    const sortedCommits = mockCommits.sort((a, b) => {
      return new Date(b.committedDate).getTime() - new Date(a.committedDate).getTime();
    });
    expect(sortedCommits).toEqual(mockCommits);
  });
});

describe("Testing getLongestWorkdayStreak", () => {
  it("should return the longest workday streak correctly, streak should not break even with gaps during weekend", () => {
    const expectedStreakLength = 3;
    const mockCommitsWithGaps = generateMockCommits(new Date("2024-03-19T12:00:00Z"), 8, [0, 3, 4, 6]);

    const actualStreakLength = getLongestWorkdayStreak(mockCommitsWithGaps);

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });

  it("should not count weekends towards the streak, but not break the streak if there is a gap during the weekend either", () => {
    const expectedStreakLength = 5;
    const mockCommitsWithoutWeekendGaps: Commit[] = generateMockCommits(new Date("2024-03-18T12:00:00Z"), 7, []);
    console.log(mockCommitsWithoutWeekendGaps);

    const actualStreakLength = getLongestWorkdayStreak(mockCommitsWithoutWeekendGaps);

    expect(actualStreakLength).toEqual(expectedStreakLength);
  });
});
