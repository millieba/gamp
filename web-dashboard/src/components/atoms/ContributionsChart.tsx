"use client";
import { useEffect, useState } from "react";

interface ContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
}

interface Week {
  contributionDays: ContributionDay[];
  firstDay: string;
}

interface ContributionCalendar {
  colors: string[];
  totalContributions: number;
  weeks: Week[];
}

interface ContributionData {
  contributionCalendar: ContributionCalendar;
}

const ContributionChartSkeleton = () => (
  <div className="flex max-w-md">
    <div className="flex bg-DarkNeutral400 rounded-lg mt-2 p-4 overflow-x-auto">
      {[...Array(52)].map((_, weekIndex) => (
        <div key={weekIndex} className="flex-col animate-pulse">
          {[...Array(7)].map((_, dayIndex) => (
            <div key={dayIndex} className="rounded-sm m-0.5 h-4 w-4 bg-DarkNeutral350"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ContributionChart = () => {
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContributionData = async () => {
      const response = await fetch("/api/contributions");
      const data = await response.json();
      setContributions(data);
      setIsLoading(false);
    };
    fetchContributionData();
  }, []);

  if (!isLoading && (!contributions || !contributions.contributionCalendar)) {
    return <p>Found no contributions.</p>;
  }

  let previousMonth = "";
  let monthIndices: number[] = [];
  return isLoading || !contributions || !contributions.contributionCalendar ? (
    <ContributionChartSkeleton />
  ) : (
    <div className="bg-DarkNeutral400 rounded-lg p-4 max-w-fit">
      <div className="flex overflow-x-auto pt-4 relative max-w-sm">
        {contributions.contributionCalendar.weeks.map((week, weekIndex) => {
          const month = new Date(week.firstDay).toLocaleDateString("en-US", { month: "short" });
          const displayMonth = month !== previousMonth ? month : "";
          previousMonth = month;
          if (displayMonth !== "") monthIndices.push(weekIndex);
          return (
            <div key={weekIndex} className="flex-col relative">
              {monthIndices.includes(weekIndex) && (
                <p className="absolute -top-5 -left-2 mt-1 ml-2 text-xs text-gray-400">{displayMonth}</p>
              )}
              {week.contributionDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="rounded-sm m-0.5 h-4 w-4"
                  style={{
                    backgroundColor: day.color,
                  }}
                ></div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContributionChart;
