"use client";
import React, { PureComponent } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import tailwindConfig from "../../../tailwind.config";

const colors = tailwindConfig?.theme?.extend?.colors as Record<string, string>;

const data = [
  {
    name: "Monday",
    additions: 4000,
    deletions: 2400,
  },
  {
    name: "Tuesday",
    additions: 3000,
    deletions: 1398,
  },
  {
    name: "Wednesday",
    additions: 2000,
    deletions: 9800,
  },
  {
    name: "Thursday",
    additions: 2780,
    deletions: 3908,
  },
  {
    name: "Friday",
    additions: 1890,
    deletions: 4800,
  },
  {
    name: "Saturday",
    additions: 2390,
    deletions: 3800,
  },
  {
    name: "Sunday",
    additions: 3490,
    deletions: 4300,
  },
];

const ModificationsChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-DarkNeutral400 text-DarkNeutral1000 p-2 rounded-md shadow-lg z-50 min-w-[100px]">
          <b>{label}</b>
          <p>Additions: {payload[1].value}</p>
          <p>Deletions: {payload[0].value}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        // width={1000}
        height={300}
        data={data}
        margin={{
          top: 15,
          left: 5,
          right: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="5 5" stroke="#8C9BAB" />
        <XAxis dataKey="name" stroke={colors?.DarkNeutral1000} />
        <YAxis stroke={colors?.DarkNeutral1000} />
        <Tooltip content={CustomTooltip} />
        <Legend />
        <Line type="monotone" dataKey="deletions" stroke={colors?.Red600} strokeWidth={3} />
        <Line type="monotone" dataKey="additions" stroke={colors?.Lime600} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ModificationsChart;
