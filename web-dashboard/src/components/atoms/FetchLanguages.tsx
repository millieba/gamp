"use client";
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";
import { useSession, signOut } from "next-auth/react";
import * as d3 from "d3";

type DataItem = {
  name: string;
  value: number;
};

const FetchLanguages = () => {
  const { data: session, status } = useSession();
  const [repositories, setRepositories] = useState<
    QueryResult["user"]["repositories"]["nodes"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [languageSizes, setLanguageSizes] = useState<{ [key: string]: number }>(
    {}
  );
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const MARGIN = 7;
  const height = 50;
  const width = 50;

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.error === "RefreshAccessTokenError"
    ) {
      signOut();
    }
  }, [session, status]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/languages/");
      const data = await response.json();

      if (response.ok) {
        setRepositories(data.languages);

        // Calculate language sizes
        const sizes: { [key: string]: number } = {};
        data.languages.forEach((repo: any) => {
          repo.node.languages.edges.forEach((language: any) => {
            if (sizes[language.node.name]) {
              sizes[language.node.name] += language.size;
            } else {
              sizes[language.node.name] = language.size;
            }
          });
        });
        setLanguageSizes(sizes);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
      setError("An error occurred while fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const colors = ["#604ad2", "#735eda", "#8471e2", "#9685e9", "#a798f0"];
  const radius = (Math.min(width, height) / 2 - MARGIN)/2;
  const innerRadius = 2;

  const dataItems: DataItem[] = Object.entries(languageSizes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const remainingTotal = dataItems
    .slice(4)
    .reduce((total, item) => total + item.value, 0);
  
  const newDataItems = [
    ...dataItems.slice(0, 4),
    { name: 'Other', value: remainingTotal },
  ];

  const pie = d3.pie<DataItem>().value((d: DataItem) => d.value)(newDataItems);

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  const arcOver = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(radius + 2);

  const total = d3.sum(dataItems, (d: DataItem) => d.value);

  const calculatePercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1);
  };



  return (
    <div className="grid xs:grid-cols-1 sm:grid-cols-2">
      <svg
        viewBox={`0 0 ${width/2} ${height/2}`}
        style={{ display: "inline-block" }}
      >
        <g transform={`translate(${width / 4}, ${height / 4})`}>
          {pie.map((d: any, i: number) => (
            <path
              key={i}
              d={(hoveredSlice === i ? arcOver(d) : arc(d)) ?? ""}
              fill={colors[i]}
              onMouseOver={() => setHoveredSlice(i)}
              onMouseOut={() => setHoveredSlice(null)}
            />
          ))}
        </g>
      </svg>
      <svg style={{ display: "inline-block" }}>
        <g>
          {pie.map((d: any, i: number) => (
            <g
              transform={`translate(0, ${i * 20})`}
              key={i}
              onMouseOver={() => setHoveredSlice(i)}
              onMouseOut={() => setHoveredSlice(null)}
            >
              <rect
                x="10"
                y="6"
                width={width / 10}
                height={width / 10}
                fill={colors[i]}
              />
              {/* TODO: fill with the right color */}
              <text
                x="28"
                y="9"
                dy="0.35em"
                className={`text-sm fill-DarkNeutral1100 ${
                  hoveredSlice === i ? `font-bold` : ``
                }`}
              >
                {d.data.name}, {calculatePercentage(d.data.value)}%
              </text>
            </g>
          ))}
        </g>
      </svg>
      <p>Amongst your other used languages:
        {dataItems.slice(4).map((item) => (
            <>
            {item.name}, 
            </>
        ))}
      </p>
    </div>
  );
};

export default FetchLanguages;
