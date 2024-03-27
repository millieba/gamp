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

      // For now we keep the original green colours, but they can be replaced by anything by returning different hex colour codes
      case "#9be9a8": // Original light green
        return colour;

      case "#40c463": // Original medium green
        return colour;

      case "#30a14e": // Original deep green
        return colour;

      case "#216e39": // Original very deep green
        return colour;

      default:
        return colour; // For any other colour, just return the original colour as is. Shouldn't happen, but just in case e.g. GitHub changes the colours
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
          ? `You've made ${contributions.contributionCalendar.totalContributions} contributions in the last year. In the chart below, you can see the contributions you've made per day.`
          : ""
      }
      content={isLoading ? <ContributionChartSkeleton /> : <ContributionChart contributions={contributions} />}
    />
  );
};

export default ContributionChartWrapper;
