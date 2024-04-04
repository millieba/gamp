"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import tailwindConfig from "../../../tailwind.config";
import { useSyncContext } from "@/contexts/SyncContext";
import { format } from "date-fns";
import { TooltipProps } from "recharts";

const colors = tailwindConfig?.theme?.extend?.colors as Record<string, string>;

export const ModificationsChartSkeleton = () => {
  return (
    <div className="animate-pulse ml-9 flex mb-12">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between h-64">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-3 w-5 bg-DarkNeutral300 rounded-full"></div>
        ))}
      </div>
      <div className="relative w-full h-64 rounded ml-2">
        {/* Dashed grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="border-t border-[#8C9BAB]  border-dashed"></div>
          ))}
        </div>
        {/* Axes lines */}
        <div className="absolute inset-0 flex items-center justify-between border-l border-b border-[#8C9BAB]"></div>
        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-3 w-5 bg-DarkNeutral300 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
const ModificationsChart = () => {
  const { stats } = useSyncContext();
  const error = console.error;

  const formatDateToWeekdayAndDate = (tickItem: string) => {
    return format(new Date(tickItem), "EEEE do MMMM");
  };

  const formatDateToWeekday = (tickItem: string) => {
    return format(new Date(tickItem), "ccc");
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
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

  // To ignore the warning about defaultProps in recharts being outdated in a major future release
  console.error = (...args: string[]) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        // width={1000}
        height={300}
        data={stats?.dailyModifications?.slice(1)}
        margin={{
          top: 15,
          left: 5,
          right: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#8C9BAB" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateToWeekday}
          stroke={colors?.DarkNeutral1000}
          className="text-sm"
        />
        <YAxis stroke={colors?.DarkNeutral1000} className="text-sm" />
        <Tooltip content={CustomTooltip} />
        <Legend />
        <Line type="monotone" dataKey="deletions" stroke={colors?.Red500} strokeWidth={3} />
        <Line type="monotone" dataKey="additions" stroke={colors?.Lime500} strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ModificationsChart;
