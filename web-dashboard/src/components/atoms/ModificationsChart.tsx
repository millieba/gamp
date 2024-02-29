"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import tailwindConfig from "../../../tailwind.config";
import { useSyncContext } from "@/contexts/SyncContext";
import { format } from "date-fns";

const colors = tailwindConfig?.theme?.extend?.colors as Record<string, string>;

const ModificationsChart = () => {
  const { stats } = useSyncContext();

  const formatDateToWeekdayAndDate = (tickItem: string) => {
    return format(new Date(tickItem), "EEEE do MMMM");
  };

  const formatDateToWeekday = (tickItem: string) => {
    return format(new Date(tickItem), "ccc");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-DarkNeutral400 text-DarkNeutral1000 p-2 rounded-md shadow-lg z-50 min-w-[100px]">
          <b>{formatDateToWeekdayAndDate(label)}</b>
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
        data={stats?.dailyModifications.slice(1)}
        margin={{
          top: 15,
          left: 5,
          right: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#8C9BAB" />
        <XAxis dataKey="date" tickFormatter={formatDateToWeekday} stroke={colors?.DarkNeutral1000} />
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
