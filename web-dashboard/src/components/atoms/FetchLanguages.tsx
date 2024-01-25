"use client";
import { useEffect, useMemo, useState } from "react";
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
  const MARGIN = 30;
  const height = 400;
  const width = 700;

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

  const colors = d3.scaleOrdinal(d3.schemeCategory10);
  const radius = Math.min(width, height) / 2 - MARGIN;
  const innerRadius = 70;

  const dataItems: DataItem[] = Object.entries(languageSizes).map(
    ([name, value]) => ({ name, value })
  );

  const pie = d3.pie<DataItem>().value((d: DataItem) => d.value)(dataItems);

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

  const arcOver = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(radius + 10);

  const total = d3.sum(dataItems, (d: DataItem) => d.value);

  const calculatePercentage = (value: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div>
      <svg width={width} height={height} style={{ display: "inline-block" }}>
        <g transform={`translate(${width / 3}, ${height / 2})`}>
          {pie.map((d: any, i: number) => (
            <path
              key={i}
              d={hoveredSlice === i ? arcOver(d) : arc(d)}
              fill={colors(i)}
              style={{cursor: 'pointer', strokeWidth: '1px'}}
              onMouseOver={() => setHoveredSlice(i)}
              onMouseOut={() => setHoveredSlice(null)}
            />
          ))}
        </g>
        <g transform={`translate(${width - 250}, ${height / 2 - pie.length * 20 / 2})`}>
        {pie.map((d: any, i: number) => (
          <g transform={`translate(0, ${i * 20})`} key={i}>
            <rect width="18" height="18" fill={colors(i)}/>
            {/* TODO: fill with the right color */}
            <text x="24" y="9" dy="0.35em" fill="#fff">{d.data.name}, {calculatePercentage(d.data.value)}%</text>
          </g>
        ))}
      </g>
      </svg>
    </div>
  );
};

export default FetchLanguages;
