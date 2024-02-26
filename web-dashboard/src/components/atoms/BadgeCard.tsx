import { CheckCircleIcon } from "@heroicons/react/24/outline";
import React, { ReactElement } from "react";

export interface BadgeDetails {
  name: string;
  image: string;
  description: string;
  points: number;
  progress: number;
  threshold: number;
  achieved: boolean;
}

const BadgeCard: React.FC<BadgeDetails> = ({ name, image, description, points, progress, threshold, achieved }) => {
  const gradientColor = "bg-DarkNeutral300";
  const percentage = Math.floor((progress / threshold) * 100);
  const remainingProgress = threshold - progress;

  return (
    <div className={`p-8 m-2 rounded-lg shadow-md ${gradientColor} w-[500px] flex flex-wrap`}>
      <img src={image} alt="Badge" />
      <h1 className="text-2xl font-bold mb-4 pr-4 text-DarkNeutral1000">{name}</h1>
      <p className="text-DarkNeutral1100 pr-4">{description}</p>

      {achieved ? (
        <>
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <div>You achieved {points} points for this badge!</div>
        </>
      ) : (
        <>
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-blue-700 dark:text-white">Flowbite</span>
            <span className="text-sm font-medium text-blue-700 dark:text-white">45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
          <div>
            You only need {remainingProgress} more commits to achieve this! {percentage}
          </div>
        </>
      )}
    </div>
  );
};

export default BadgeCard;
