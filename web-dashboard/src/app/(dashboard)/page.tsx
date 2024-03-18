"use client";
import BadgesHomePage from "@/components/atoms/home/BadgesHomePage";
import ShortStatView from "@/components/molecules/home/ShortStatView";
import { useSyncContext } from "@/contexts/SyncContext";
import { FullBadge } from "@/components/atoms/home/RecentAndApproachingBadges";

const HomePage = () => {
  const { isLoading, preferences, stats, badges, allBadges } = useSyncContext();

  // Getting the most recent badge
  const sorted = [...badges]
    .map((badge) => {
      const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
      return { ...badge, ...fullBadge } as FullBadge;
    })
    .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());

  // Getting the most used language from the stats by filtering out the excluded languages and then sorting it by bytes written
  const programmingLanguages = stats?.programmingLanguages
    ?.map((lang) => ({ bytesWritten: lang.bytesWritten, name: lang.name }))
    .filter((lang) => !preferences?.excludeLanguages?.includes(lang.name))
    .sort((a, b) => b.bytesWritten - a.bytesWritten);

  // Loading when site is fetching
  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="max:w-screen">
        <div
          className={`rounded-lg shadow-md bg-DarkNeutral100 p-4 w-[100%] grid sm:grid-cols-1 md:grid-cols-3 gap-4 justify-between mb-4`}
        >
          {preferences?.showWorkdayStreak ? (
            <ShortStatView
              title="Workday Streak"
              children={`${stats?.workdayStreak === null ? 0 : stats?.workdayStreak}`}
              description="Streak of workdays"
            />
          ) : (
            <ShortStatView
              title="Recent Badge"
              children={
                sorted[0]?.name === undefined
                  ? "No recent badges."
                  : `${sorted[0].name} is your most recently earned badge!`
              }
              description="Maybe you can earn another one today?"
            />
          )}
          {preferences?.showStrictStreak ? (
            <ShortStatView
              title="Strict Streak"
              children={`${stats?.strictStreak === null ? 0 : stats?.strictStreak}`}
              description="Daily streak, including weekends"
            />
          ) : (
            <ShortStatView
              title="Assigned Issues"
              children={`${stats?.issueCount}`}
              description="Issues assigned to you"
            />
          )}
          <ShortStatView
            title="Most Used Language"
            children={
              programmingLanguages?.[0]?.name === undefined ? "No languages used" : programmingLanguages?.[0]?.name
            }
            description={
              preferences?.excludeLanguages?.length === 0
                ? "No languages excluded"
                : `You've excluded ${preferences?.excludeLanguages?.length} ${
                    preferences?.excludeLanguages?.length === 1 ? "language" : "languages"
                  }`
            }
          />
        </div>
        <div className="flex flex-wrap max-w-[350px]">
          <BadgesHomePage />
        </div>
      </div>
    );
  }
};

export default HomePage;
