"use client";
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";
import * as d3 from "d3";
import React from "react";
import { calculatePercentage } from "@/utils/utils";
import { DataItem, PieArcDatum, Language, Repository, Data } from "@/utils/types";


const margin = 7;
const height = 50;
const width = 50;
const radius = (Math.min(width, height) / 2 - margin) / 2;
const innerRadius = 2;
const outerRadius = radius;
const colors = ["#604ad2", "#735eda", "#8471e2", "#9685e9", "#a798f0"];

const FetchLanguages = () => {
  const [repositories, setRepositories] = useState<
    QueryResult["user"]["repositories"]["nodes"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [languageSizes, setLanguageSizes] = useState<{ [key: string]: number }>(
    {}
  );
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/languages/");
      const data = await response.json();

      if (response.ok) {
        setRepositories(data.languages);

        // Calculate language sizes
        const sizes: { [key: string]: number } = {};
        data.languages.forEach((repo: Repository) => {
          repo.node.languages.edges.forEach((language: Language) => {
            if (sizes[language.node.name]) {
              sizes[language.node.name] += language.size;
            } else {
              sizes[language.node.name] = language.size;
            }
          });
        });
        setLanguageSizes(sizes);
        setIsLoading(false);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
      setError("An error occurred while fetching data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sort the languages by decreasing size in bytes
  const sortedLanguages: DataItem[] = Object.entries(languageSizes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Make a category for "other" languages, so we don't have to display all slices
  const totalSizeOfOtherLanguages = sortedLanguages
    .slice(4)
    .reduce((total, item) => total + item.value, 0);

  // New data items containing the first 4 languages and the "other" category
  const languagesIncludingOther = [
    ...sortedLanguages.slice(0, 4),
    { name: "Other", value: totalSizeOfOtherLanguages },
  ];

  // Creating the pie outline
  const pie = d3.pie<DataItem>().value((d: DataItem) => d.value)(
    languagesIncludingOther
  );

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  const arcOver = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(radius + 1);

  // Sum of all bytes
  const total = d3.sum(sortedLanguages, (d: DataItem) => d.value);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div
            className="grid xs:grid-cols-1 md:grid-cols-2 justify-center"
            style={{ maxWidth: "560px" }}
          >
            <div>
              <svg
                viewBox={`0 0 ${width / 2} ${height / 2}`}
                className="max-w-xs mx-auto"
              >
                <g transform={`translate(${width / 4}, ${height / 4})`}>
                  {pie.map((d: PieArcDatum, i: number) => (
                    <path
                      key={i}
                      d={(hoveredSlice === i ? arcOver({...d, innerRadius, outerRadius}) : arc({...d, innerRadius, outerRadius})) ?? ""}
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
                      <rect
                        x="10"
                        y="30"
                        width={width / 6}
                        height={width / 6}
                        fill={colors[i]}
                      />
                      <text
                        x="28"
                        y="33"
                        dy="0.35em"
                        className={`text-xs fill-DarkNeutral1100 ${
                          hoveredSlice === i ? `font-bold` : ``
                        }`}
                        onFocus={() => setHoveredSlice(i)} 
                        onBlur={() => setHoveredSlice(null)} 
                        tabIndex={0}
                      >
                        {d.data.name},{" "}
                        {calculatePercentage(d.data.value, total)}%
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
          <p>
            Amongst your other used languages:{" "}
            {sortedLanguages.slice(4).map((item, index, arr) => (
              <React.Fragment key={item.name}>
                {item.name} ({calculatePercentage(item.value, total)}%)
                {index < arr.length - 1 ? ", " : "."}
              </React.Fragment>
            ))}
          </p>
        </>
      )}
    </>
  );
};

export default FetchLanguages;
