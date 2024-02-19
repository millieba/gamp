"use client";
import StatBox from "@/components/atoms/StatBox";
import LanguageChart from "@/components/atoms/LanguageChart";
import { useSyncContext } from "@/contexts/SyncContext";
import InfoCard from "@/components/atoms/InfoCard";

const StatsPage = () => {
  const { badges, isLoading, stats } = useSyncContext();

  const convertMsToDays = (ms: number) => {
    if (ms < 86400000) {
      const hours = ms / (1000 * 60 * 60);
      return [hours.toFixed(0), "hours"];
    } else {
      const days = ms / (1000 * 60 * 60 * 24);
      return [days.toFixed(0), "days"];
    }
  };

  const data = [
    {
      icon: "star",
      heading: "Achievements",
      subheading: "Badges earned",
      number: badges?.length || 0,
      unit: "badges",
      description: `You have earned ${badges?.length > 0 ? badges?.length : 0} badges out of 3 possible!`,
    },
    {
      icon: "sparkles",
      heading: "Work done",
      subheading: "Issues created",
      number: stats?.issueCount || 0,
      unit: "issues",
      description: `In addition, you have closed ${stats?.closedIssueCount} out of ${stats?.issueCount} issues!`,
    },
    {
      icon: "clock",
      heading: "Time",
      subheading: "Average time on each issue",
      number: convertMsToDays(stats?.avgTimeToCloseIssues || 0)[0],
      unit: convertMsToDays(stats?.avgTimeToCloseIssues || 0)[1],
      description: `On an average, you spend ${convertMsToDays(stats?.avgTimeToCloseIssues || 0)[0]} ${
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
  ];

  return (
    <>
      <h1 className="text-2xl">Stats</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
            {data.map(
              (item, index: number) =>
                (item.number !== 0 || item.number !== null || stats !== undefined) && (
                  <InfoCard
                    key={index}
                    icon={item.icon}
                    heading={item.heading}
                    subheading={item.subheading}
                    number={Number(item.number)}
                    unit={item.unit}
                    description={item.description}
                    maxWidth="300px"
                  />
                )
            )}
          </div>
          <StatBox
            name={"Most used languages"}
            description={
              "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
            }
            content={<LanguageChart />}
            maxWidth="500px"
          />
        </>
      )}
    </>
  );
};

export default StatsPage;
