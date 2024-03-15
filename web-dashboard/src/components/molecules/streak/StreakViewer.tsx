import React from "react";

const StreakViewer = () => {
  const gradientColor = "bg-DarkNeutral300";
  return (
    <div
      className={`grid grid-cols-3 rounded-lg p-2 mt-2 mb-2 shadow-md ${gradientColor} overflow-visible overflow-wrap-anywhere w-full justify-items-stretch`}
    >
      <div className="border-r border-gray-200 pr-4 pt-3 pb-3 pl-4">
        <h1>rere</h1>
        <p>Yrere.</p>
      </div>
      <div className="border-r border-gray-200 px-4 pt-3 pb-3">
        <h1>rere</h1>
        <p>rere</p>
      </div>
      <div className="pl-4 pt-3 pb-3 pr-4">
        <h1>rere</h1>
        <p>erre</p>
      </div>
    </div>
  );
};

export default StreakViewer;
