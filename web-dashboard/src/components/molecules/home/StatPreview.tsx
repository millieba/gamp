"use client";
import ShortStatView from "@/components/atoms/home/ShortStatView";
import { useSyncContext } from "@/contexts/SyncContext";
import { FullBadge } from "@/components/atoms/home/RecentAndApproachingBadges";

const StatPreview = () => {
  const { preferences, stats, badges, allBadges } = useSyncContext();

  // Getting the most recent badge
  const sorted = [...badges]
    .map((badge) => {
      const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
      return { ...badge, ...fullBadge } as FullBadge;
    })
    .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());

  // Function to check the streak and return a string based on that
  function checkStreakAndReturnString(streakToContinue: null | number | undefined, streak: number | null | undefined) {
    if (streakToContinue === null && streak === null) {
      return "No streak, start a streak today!";
    }
    let streakValue = streakToContinue !== null ? streakToContinue : streak;
    let message = streakToContinue !== null ? ", keep it by committing today!" : ", keep going!";
    return streakValue !== null
      ? `${streakValue} ${streakValue === 1 ? "day" : "days"}${message}`
      : "Unable to calculate streak. Please try again later.";
  }

  // Getting the most used language from the stats by filtering out the excluded languages and then sorting it by bytes written
  const programmingLanguages = stats?.programmingLanguages
    ?.map((lang) => ({ bytesWritten: lang.bytesWritten, name: lang.name }))
    .filter((lang) => !preferences?.excludeLanguages?.includes(lang.name))
    .sort((a, b) => b.bytesWritten - a.bytesWritten);

  return (
    <div
      className={`rounded-lg shadow-md bg-DarkNeutral100 p-4 w-[100%] grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-between`}
    >
      {preferences?.showWorkdayStreak ? (
        <ShortStatView
          title="💼 Workday Streak"
          children={checkStreakAndReturnString(stats?.workdayStreakToContinue, stats?.workdayStreak)}
          border={true}
        />
      ) : (
        <ShortStatView
          title="🏅 Recent Badge"
          children={
            sorted[0]?.name === undefined
              ? "No recent badges."
              : `${sorted[0].name} is your most recently earned badge!`
          }
          border={true}
        />
      )}
      {preferences?.showStrictStreak ? (
        <ShortStatView
          title="📅 Strict Streak"
          children={checkStreakAndReturnString(stats?.strictStreakToContinue, stats?.strictStreak)}
          border={true}
        />
      ) : (
        <ShortStatView
          title="📝 Assigned Issues"
          children={`${stats?.issueCount} issues assigned to you!`}
          border={true}
        />
      )}
      <ShortStatView
        title="👨‍💻 Most Used Language"
        children={`${
          programmingLanguages?.[0]?.name === undefined ? "No languages used" : programmingLanguages?.[0]?.name
        }${
          preferences?.excludeLanguages?.length === 0
            ? ", no languages excluded"
            : `, you've excluded ${preferences?.excludeLanguages?.length} ${
                preferences?.excludeLanguages?.length === 1 ? "language" : "languages"
              }`
        }`}
        border={false}
      />
    </div>
  );
};

export default StatPreview;
