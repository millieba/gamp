"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";

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

const ContributionChart = () => {
  const [contributions, setContributions] = useState<ContributionData | null>(null);

  useEffect(() => {
    const fetchContributionData = async () => {
      const response = await fetch("/api/contributions");
      const data: ContributionData = await response.json();
      setContributions(data);
    };
    fetchContributionData();
  }, []);
};

export default ContributionChart;
