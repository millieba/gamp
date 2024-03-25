"use client";

import { useEffect, useState } from "react";
import { ContributionChart, ContributionChartSkeleton } from "../atoms/ContributionChart";
import StatCard from "../atoms/StatCard";

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

export interface ContributionData {
  contributionCalendar: ContributionCalendar;
}

const ContributionChartWrapper = () => {
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapColour = (colour: string): string => {
    switch (colour) {
      case "#ebedf0": // Original default white
        return "#596773"; // DarkNeutral500

      case "#9be9a8": // Original light green
        return "#b5bde2";

      case "#40c463": // Original medium green
        return "#919ed3";

      case "#30a14e": // Original deep green
        return "#7887ca";

      case "#216e39": // Original very deep green
        return "#777fff";

      default:
        return colour; // Keep the color as is for any other color
    }
  };

  useEffect(() => {
    const fetchContributionData = async () => {
      const response = await fetch("/api/contributions");
      const data = await response.json();

      const mappedData = {
        ...data,
        contributionCalendar: {
          ...data.contributionCalendar,
          weeks: data.contributionCalendar.weeks.map((week: Week) => ({
            ...week,
            contributionDays: week.contributionDays.map((day: ContributionDay) => ({
              ...day,
              color: mapColour(day.color),
            })),
          })),
          colors: data.contributionCalendar.colors.map(mapColour),
        },
      };

      setContributions(mappedData);
      setIsLoading(false);
    };
    fetchContributionData();
  }, []);

  return (
    <StatCard
      name={"Contributions"}
      description={
        contributions
          ? `You have made ${contributions.contributionCalendar.totalContributions} contributions in the last year. In the chart below, you can see the contributions you have made per day.`
          : ""
      }
      content={isLoading ? <ContributionChartSkeleton /> : <ContributionChart contributions={contributions} />}
    />
  );
};

export default ContributionChartWrapper;
