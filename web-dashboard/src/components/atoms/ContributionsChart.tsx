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

  return isLoading || !contributions || !contributions.contributionCalendar ? (
    <ContributionChartSkeleton />
  ) : (
    // TODO: The overflow-x-scroll only works if I set max-w explicitly like this? Which I don't really want, I want to use the the space available. Also why do I need to write flex twice? Oof
    <div className="bg-DarkNeutral400 rounded-lg mt-2 p-4 w-full overflow-x-auto">
      <div className="overflow-x-auto md:overflow-visible max-w-sm ">
        <div className="flex">
          {contributions.contributionCalendar.weeks.map((week, weekIndex) => {
            const isLastWeek = weekIndex === contributions.contributionCalendar.weeks.length - 1;
            const weekClass = isLastWeek ? "flex-col pr-4" : "flex-col";

            return (
              <div key={weekIndex} className={weekClass}>
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
    </div>
  );
};

export default ContributionChart;
