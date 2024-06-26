"use client";
import { useEffect, useState } from "react";
import * as d3 from "d3";
import React from "react";
import { calculatePercentage } from "@/utils/utils";
import { DataItem, PieArcDatum } from "@/utils/types";
import { ProgrammingLanguage, useSyncContext } from "@/contexts/SyncContext";

const margin = 7;
const height = 50;
const width = 50;
const radius = (Math.min(width, height) / 2 - margin) / 2;
const innerRadius = 2;
const outerRadius = radius;
const colors = ["#604ad2", "#735eda", "#8471e2", "#9685e9", "#a798f0"];

export const LanguageChartSkeleton = () => {
  return (
    <>
      <div className="w-full h-48 flex justify-center items-center mb-4">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-[#735eda]"></div>
      </div>
      <div className="w-full h-4 bg-DarkNeutral300 rounded-full animate-pulse mb-1"></div>
      <div className="w-1/2 h-4 bg-DarkNeutral300 rounded-full animate-pulse"></div>
    </>
  );
};

const LanguageChart = () => {
  const [languageSizes, setLanguageSizes] = useState<{ [key: string]: number }>({});
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const { stats, preferences } = useSyncContext();

  useEffect(() => {
    const sizes: { [key: string]: number } = {};
    stats?.programmingLanguages &&
      stats.programmingLanguages.forEach((repo: ProgrammingLanguage) => {
        if (sizes[repo.name]) {
          sizes[repo.name] += repo.bytesWritten;
        } else {
          sizes[repo.name] = repo.bytesWritten;
        }
      });

    // Filter out excluded languages
    preferences?.excludeLanguages?.forEach((language) => {
      delete sizes[language];
    });
    setLanguageSizes(sizes);
  }, [stats, preferences]);

  // Sort the languages by decreasing size in bytes
  const sortedLanguages: DataItem[] = Object.entries(languageSizes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  let languagesIncludingOther = sortedLanguages;

  // Make a category for "other" languages, but only if there are more than 4 languages
  if (sortedLanguages.length > 4) {
    const totalSizeOfOtherLanguages = sortedLanguages.slice(4).reduce((total, item) => total + item.value, 0);

    // New data items containing the first 4 languages and the "other" category
    languagesIncludingOther = [...sortedLanguages.slice(0, 4), { name: "Other", value: totalSizeOfOtherLanguages }];
  }

  const pie = d3.pie<DataItem>().value((d: DataItem) => d.value)(
    sortedLanguages.length > 4 ? languagesIncludingOther : sortedLanguages
  );

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  const arcOver = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(radius + 1);

  // Sum of all bytes
  const total = d3.sum(sortedLanguages, (d: DataItem) => d.value);

  // TODO: create logic so that this doesn't show up if there are no data
  if (!sortedLanguages || sortedLanguages.length === 0) {
    return <p>No data to generate graph.</p>;
  }

  return (
    <>
      <div className="grid xs:grid-cols-1 md:grid-cols-2 justify-center" style={{ maxWidth: "560px" }}>
        <div>
          <svg viewBox={`0 0 ${width / 2} ${height / 2}`} className="max-w-xs mx-auto">
            <g transform={`translate(${width / 4}, ${height / 4})`}>
              {pie.map((d: PieArcDatum, i: number) => (
                <path
                  key={i}
                  d={
                    (hoveredSlice === i
                      ? arcOver({ ...d, innerRadius, outerRadius })
                      : arc({ ...d, innerRadius, outerRadius })) ?? ""
                  }
                  fill={colors[i]}
                  onMouseOver={() => setHoveredSlice(i)}
                  onMouseOut={() => setHoveredSlice(null)}
                  aria-label={`${d.data.name}, ${calculatePercentage(d.data.value, total)}%`}
                />
              ))}
            </g>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg>
            <g>
              {pie.map((d: PieArcDatum, i: number) => (
                <g
                  transform={`translate(0, ${i * 20})`}
                  key={i}
                  onMouseOver={() => setHoveredSlice(i)}
                  onMouseOut={() => setHoveredSlice(null)}
                >
                  <rect x="10" y="30" width={width / 6} height={width / 6} fill={colors[i]} />
                  <text
                    x="28"
                    y="33"
                    dy="0.35em"
                    className={`text-xs fill-DarkNeutral1100 ${hoveredSlice === i ? `font-bold` : ``}`}
                    onFocus={() => setHoveredSlice(i)}
                    onBlur={() => setHoveredSlice(null)}
                    tabIndex={0}
                  >
                    {d.data.name}, {calculatePercentage(d.data.value, total)}%
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
      {sortedLanguages.length > 4 && (
        <p>
          Other languages:{" "}
          {sortedLanguages.slice(4).map((item, index, arr) => (
            <React.Fragment key={item.name}>
              {item.name} ({calculatePercentage(item.value, total)}%)
              {index < arr.length - 1 ? ", " : "."}
            </React.Fragment>
          ))}
        </p>
      )}
    </>
  );
};

export default LanguageChart;
