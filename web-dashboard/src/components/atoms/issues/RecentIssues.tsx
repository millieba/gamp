import { useSyncContext } from "@/contexts/SyncContext";
import React from "react";

const RecentIssues = () => {
  const { isLoading, stats } = useSyncContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {stats?.assignedIssues.map((issue, index) => (
        <div key={index}>{issue.title}</div>
      ))}
    </div>
  );
};

export default RecentIssues;
