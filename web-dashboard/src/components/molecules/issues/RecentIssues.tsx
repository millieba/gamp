import { Stats } from "@/contexts/SyncContext";
import React from "react";

export interface RecentIssuesProps {
  stats: Stats | undefined;
}

const RecentIssues: React.FC<RecentIssuesProps> = ({ stats }) => {
  const getRepoNameFromUrl = (url: string) => {
    const urlSplit = url.split("/");
    return urlSplit[urlSplit.length - 3];
  };

  return (
    <div className={`max-w-[600px] p-4 rounded-lg shadow-md bg-DarkNeutral100 w-full grid grid-row`}>
      {stats?.assignedIssues.length === 0 ? (
        <span className="mb-1">Your Plate's Clear: No Assigned Issues &#x1F60A;</span>
      ) : (
        <>
          <span className="mb-1">Newly Assigned Issues &#129299;</span>
          <div className="max-h-[100px] overflow-auto p-1.5 text-sm">
            {stats?.assignedIssues.map((issue, index) => (
              <a href={issue.url} target="_blank" rel="noopener noreferrer" key={index}>
                <div
                  className={`relative z-[1000] p-2 mb-2 rounded-lg shadow-md bg-DarkNeutral300 hover:bg-DarkNeutral350 flex flex-col sm:flex-grow 2xl:flex-grow-0 smallBounce`}
                >
                  <h1 className="font-bold">
                    Issue #{issue.number} in {getRepoNameFromUrl(issue.url)}
                  </h1>
                  <p className="text-xs">{issue.title}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
      {/* IDEA: Maybe we could add a issue-related badge the user is close to achieving at the bottom to make it more tempting to achieve it? */}
    </div>
  );
};

export default RecentIssues;
