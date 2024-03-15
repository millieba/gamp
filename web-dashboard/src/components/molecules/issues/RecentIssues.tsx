import { AssignedIssueInterface } from "@/app/api/issues/issuesUtils";
import { Stats } from "@/contexts/SyncContext";
import React from "react";

export interface RecentIssuesProps {
  stats: Stats | undefined;
}

const RecentIssues: React.FC<RecentIssuesProps> = ({ stats }) => {
  let openIssues: AssignedIssueInterface[] = [];

  // Check if stats and assignedIssues exist
  if (stats && stats.assignedIssues) {
    // Sort by dat in descending order, this will help display the most recent open issues first
    const sortedIssues = [...stats.assignedIssues].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Want to separate between open and closed issues, therefore we filter the sortedIssues array
    openIssues = sortedIssues.filter((issue) => issue.state === "OPEN");
  }

  const getRepoNameFromUrl = (url: string) => {
    const urlSplit = url.split("/");
    return urlSplit[urlSplit.length - 3];
  };

  return (
    <div className={`max-w-[600px] p-4 rounded-lg shadow-md bg-DarkNeutral100 w-full grid grid-row`}>
      {openIssues.length === 0 ? (
        <span className="mb-1">Your Plate's Clear: No Assigned Tasks &#x1F60A;</span>
      ) : (
        <>
          <span className="mb-1">Newly Assigned Issues &#129299;</span>
          <div className="max-h-[100px] overflow-auto p-1.5 text-sm">
            {openIssues.map((issue, index) => (
              <a href={issue.url} target="_blank" rel="noopener noreferrer" key={index}>
                <div
                  className={`relative z-[1000] p-2 mb-2 rounded-lg shadow-md bg-DarkNeutral300 hover:bg-DarkNeutral350 flex flex-col sm:flex-grow 2xl:flex-grow-0 bouncyIssues`}
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
