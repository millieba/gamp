"use client";
import StatCard from "@/components/atoms/StatCard";
import LanguageChart from "@/components/atoms/LanguageChart";
import { useSyncContext } from "@/contexts/SyncContext";
import InfoCard from "@/components/atoms/InfoCard";
import ModificationsChart from "@/components/atoms/ModificationsChart";
import ContributionChartWrapper from "@/components/molecules/ContributionsChartWrapper";
import PageHeading from "@/components/atoms/PageHeading";

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
      iconColour: stats?.strictStreak ? "text-orange-400" : undefined,
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
      iconColour: stats?.workdayStreak ? "text-orange-400" : undefined,
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
      unit: badges?.length === 1 ? "badge" : "badges",
      description: `You have earned ${badges?.length > 0 ? badges?.length : 0} badges out of ${
        allBadges.length
      } possible!`,
    },
    {
      icon: "sparkles",
      heading: "Work done",
      subheading: "Assigned issues",
      number: stats?.issueCount || 0,
      unit: stats?.issueCount === 1 ? "issue" : "issues",
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
      unit: stats?.createdPrs === 1 ? "pull request" : "pull requests",
      description: `You have created ${stats?.createdPrs} pull requests and ${
        stats?.createdAndMergedPrs === stats?.createdPrs ? "all" : stats?.createdAndMergedPrs
      } of them have been merged!`,
    },
    {
      icon: "language",
      heading: "Languages",
      subheading: "Used languages",
      number: stats?.programmingLanguages?.length || 0,
      unit: stats?.programmingLanguages?.length === 1 ? "language" : "languages",
      description: "This is how many languages you have used in your repositories!",
    },
    {
      icon: "command",
      heading: "Commits",
      subheading: "Your total commits",
      number: stats?.commitCount || 0,
      unit: stats?.commitCount === 1 ? "commit" : "commits",
      description: "Number of unique commits authored by you. Keep them coming!",
    },
  ];

  return (
    <div className="">
      <PageHeading title="Stats" />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-4">
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
          <div className="flex flex-grow gap-4 mb-4">
            <div>
              <div className="lg:flex gap-4">
                <div className="lg:flex-1 mb-4">
                  <StatCard
                    name={"Most used languages"}
                    description={
                      "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
                    }
                    content={<LanguageChart />}
                  />
                </div>
                <div className="lg:flex-1 mb-4">
                  <StatCard
                    name={"Additions and deletions"}
                    description={
                      "In the chart below, you can see the code lines added and deleted per day the last seven days."
                    }
                    content={<ModificationsChart />}
                  />
                </div>
              </div>
              <div>
                <ContributionChartWrapper />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;
