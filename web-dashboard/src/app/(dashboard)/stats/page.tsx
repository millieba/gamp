"use client";
import StatCard from "@/components/atoms/StatCard";
import LanguageChart from "@/components/atoms/LanguageChart";
import { useSyncContext } from "@/contexts/SyncContext";
import InfoCard from "@/components/atoms/InfoCard";
import ModificationsChart from "@/components/atoms/ModificationsChart";

const StatsPage = () => {
  const { badges, isLoading, stats, allBadges, preferences } = useSyncContext();

  const convertMsToDays = (ms: number) => {
    if (ms < 86400000) {
      const hours = ms / (1000 * 60 * 60);
      return [hours.toFixed(0), "hours"];
    } else {
      const days = ms / (1000 * 60 * 60 * 24);
      return [days.toFixed(0), "days"];
    }
  };

  const streakData = [];
  if (preferences?.showStrictStreak) {
    streakData.push({
      icon: "fire",
      iconColour: stats?.strictStreak ? "orange-500" : undefined,
      heading: "Strict Streak",
      subheading:
        stats?.strictStreakToContinue !== null
          ? `Commit today to extend your streak to ${
              stats?.strictStreakToContinue && stats?.strictStreakToContinue + 1
            } days`
          : stats?.strictStreak !== null
          ? "Consecutive days with commits"
          : "Commit today to start a streak",
      number: stats?.strictStreak !== null ? stats?.strictStreak : stats?.strictStreakToContinue || 0,
      unit: stats?.strictStreak === 1 ? "day" : "days",
      description: "This is how many days in a row you have committed",
    });
  }

  if (preferences?.showWorkdayStreak) {
    streakData.push({
      icon: "fire",
      iconColour: stats?.workdayStreak ? "orange-500" : undefined,
      heading: "Workday Streak",
      subheading:
        stats?.workdayStreakToContinue !== null
          ? `Commit today to extend your streak to ${
              stats?.workdayStreakToContinue && stats?.workdayStreakToContinue + 1
            } days`
          : stats?.workdayStreak !== null
          ? "Consecutive workdays with commits"
          : "Commit today to start a streak",
      number: stats?.workdayStreak !== null ? stats?.workdayStreak : stats?.workdayStreakToContinue || 0,
      unit: stats?.workdayStreak === 1 ? "workday" : "workdays",
      description: "This is how many weekdays (Monday to Friday) in a row you have committed",
    });
  }

  const data = [
    ...streakData,
    {
      icon: "star",
      heading: "Achievements",
      subheading: "Badges earned",
      number: badges?.length || 0,
      unit: "badges",
      description: `You have earned ${badges?.length > 0 ? badges?.length : 0} badges out of ${
        allBadges.length
      } possible!`,
    },
    {
      icon: "sparkles",
      heading: "Work done",
      subheading: "Assigned issues",
      number: stats?.issueCount || 0,
      unit: "issues",
      description: `In addition, you have closed ${stats?.closedIssueCount} out of ${stats?.issueCount} assigned issues!`,
    },
    {
      icon: "clock",
      heading: "Time",
      subheading: "Average time on each issue",
      number: convertMsToDays(stats?.avgTimeToCloseIssues || 0)[0],
      unit: convertMsToDays(stats?.avgTimeToCloseIssues || 0)[1],
      description: `On average, you spend ${convertMsToDays(stats?.avgTimeToCloseIssues || 0)[0]} ${
        convertMsToDays(stats?.avgTimeToCloseIssues || 0)[1]
      } on each issue!`,
    },
    {
      icon: "puzzle",
      heading: "Contributions",
      subheading: "Pull requests created",
      number: stats?.createdPrs || 0,
      unit: "pull requests",
      description: `You have created ${stats?.createdPrs} pull requests and ${
        stats?.createdAndMergedPrs === stats?.createdPrs ? "all" : stats?.createdAndMergedPrs
      } of them have been merged!`,
    },
    {
      icon: "language",
      heading: "Languages",
      subheading: "Used languages",
      number: stats?.programmingLanguages?.length || 0,
      unit: "languages",
      description: "This is how many languages you have used in your repositories!",
    },
  ];

  return (
    <>
      <h1 className="text-2xl">Stats</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex flex-wrap">
            {data.map(
              (item, index: number) =>
                (item.number !== 0 || item.number !== null || stats !== undefined) && (
                  <div className="flex-grow" key={index}>
                    <InfoCard
                      icon={item.icon}
                      heading={item.heading}
                      subheading={item.subheading}
                      number={Number(item.number)}
                      unit={item.unit}
                      description={item.description}
                      iconColour={item.iconColour}
                    />
                  </div>
                )
            )}
          </div>
          <div className="lg:flex">
            <div className="lg:flex-1">
              <StatCard
                name={"Most used languages"}
                description={
                  "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
                }
                content={<LanguageChart />}
              />
            </div>
            <div className="lg:flex-1">
              <StatCard
                name={"Additions and deletions"}
                description={
                  "In the chart below, you can see the code lines added and deleted per day the last seven days."
                }
                content={<ModificationsChart />}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StatsPage;
