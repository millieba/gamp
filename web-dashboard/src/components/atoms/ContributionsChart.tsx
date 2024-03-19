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
  const weekdays = ["", "Mon", "", "Wed", "", "Fri", ""];

  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ weekIndex: number; dayIndex: number } | null>(null);

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

  const getWeekDayFromIndex = (index: number) => {
    return weekdays[index];
  };

  // Function for calculating the position of the tooltip and tooltip pointer based on the week and day index.
  // This is necessary to avoid the tooltip overflowing the chart.
  const calculateTooltipPosition = (weekIndex: number, dayIndex: number) => {
    const weeksLength = contributions!.contributionCalendar!.weeks.length;
    const sideCutOff = 6;
    const isTop = dayIndex >= 0 && dayIndex <= 2;
    const isBottom = dayIndex >= 3 && dayIndex <= sideCutOff;
    const isLeft = weekIndex >= 0 && weekIndex <= sideCutOff;
    const isMiddle = weekIndex > sideCutOff && weekIndex < weeksLength - sideCutOff;
    const isRight = weekIndex >= weeksLength - sideCutOff && weekIndex < weeksLength;

    let tooltipPlacement = "";
    let tooltipPointer = "";

    if (isTop && isRight) {
      tooltipPlacement = "right-0 top-5";
      tooltipPointer = "-top-1 right-1";
    } else if (isBottom && isRight) {
      tooltipPlacement = "right-0 -top-5";
      tooltipPointer = "-bottom-1 right-1";
    } else if (isMiddle && isTop) {
      tooltipPlacement = "left-1/2 transform -translate-x-1/2 top-5";
      tooltipPointer = "-top-1 left-1/2 transform -translate-x-1/2";
    } else if (isMiddle && isBottom) {
      tooltipPlacement = "left-1/2 transform -translate-x-1/2 -top-5";
      tooltipPointer = "-bottom-1 left-1/2 transform -translate-x-1/2";
    } else if (isTop && isLeft) {
      tooltipPlacement = "left-0 top-5";
      tooltipPointer = "-top-1 left-1";
    } else if (isBottom && isLeft) {
      tooltipPlacement = "left-0 -top-5";
      tooltipPointer = "-bottom-1 left-1";
    }

    return { tooltipPlacement, tooltipPointer };
  };
  let previousMonth = "";
  let monthIndices: number[] = [];

  return isLoading || !contributions || !contributions.contributionCalendar ? (
    <ContributionChartSkeleton />
  ) : (
    <div className="bg-DarkNeutral400 rounded-lg p-4 overflow-x-auto">
      <div className="overflow-x-auto">
        <div className="flex pt-4 relative max-w-sm">
          {contributions.contributionCalendar.weeks.map((week, weekIndex) => {
            const month = new Date(week.firstDay).toLocaleDateString("en-US", { month: "short" }); // Formatting the date to a shortened month name

            // Store the indices of the weeks that start a new month (so we only display the month once per month, not once per week)
            const displayMonth = month !== previousMonth ? month : "";
            previousMonth = month;
            const isFirstWeek = weekIndex === 0;
            if (displayMonth !== "") monthIndices.push(weekIndex);

            return (
              // COLUMNS (1 WEEK OF CONTRIBUTIONS)
              <div key={weekIndex} className="flex-col relative">
                {monthIndices.includes(weekIndex) && // If the current week index is in the array of indices that start a new month, display the month
                  // MONTH LABELS / X AXIS LABELS
                  (isFirstWeek ? ( // The first column needs a little extra margin because of the y axis labels
                    <p className="ml-10 absolute -top-5 -left-1.5 mt-1 text-xs text-DarkNeutral1000">{displayMonth}</p>
                  ) : (
                    <p className="absolute -top-5 -right-1.5 mt-1 text-xs text-DarkNeutral1000">{displayMonth}</p>
                  ))}
                {week.contributionDays.map((day, dayIndex) => (
                  // CELLS (1 DAY OF CONTRIBUTIONS)
                  <div
                    key={dayIndex} // Display the contribution cells, and coluor them based on the contribution count
                    className={`relative rounded-sm m-0.5 h-4 w-4 ml-${isFirstWeek ? "9" : "0"}`}
                    style={{
                      backgroundColor: day.color,
                    }}
                    onMouseEnter={() => setHoveredCell({ weekIndex, dayIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hoveredCell && hoveredCell.weekIndex === weekIndex && hoveredCell.dayIndex === dayIndex && (
                      // TOOLTIP
                      <div
                        className={`absolute bg-DarkNeutral400 text-DarkNeutral1100 text-xs font-thin z-10 rounded-md whitespace-nowrap p-1 ${
                          calculateTooltipPosition(weekIndex, dayIndex).tooltipPlacement
                        }`}
                      >
                        {day.contributionCount} contributions on {new Date(day.date).toLocaleDateString()}
                        {/* TOOLTIP POINTER */}
                        <div
                          className={`absolute w-2 h-2 bg-DarkNeutral400 transform rotate-45 ${
                            calculateTooltipPosition(weekIndex, dayIndex).tooltipPointer
                          }`}
                        ></div>
                      </div>
                    )}

                    {/* WEEK DAY LABELS / Y AXIS LABELS */}
                    {isFirstWeek && (
                      <p className="absolute text-xs -left-9 text-DarkNeutral1000">{getWeekDayFromIndex(dayIndex)}</p>
                    )}
                  </div>
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
