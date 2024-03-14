"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchContributionData = async () => {
      const response = await fetch("/api/contributions");
      const data: ContributionData = await response.json();
      setContributions(data);
    };
    fetchContributionData();

    if (contributions) {
      setIsLoading(false);
    }
  }, [session]);

  if (!contributions) {
    return null;
  }

  const weeks = contributions.contributionCalendar.weeks;

  return !isLoading ? (
    <div className="flex bg-DarkNeutral400 rounded-lg mt-2 p-4">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex}>
          {week.contributionDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="rounded-md m-0.5 h-5 w-5"
              style={{
                backgroundColor: day.color,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  ) : null;
};

export default ContributionChart;
