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
  const bgColor = "bg-DarkNeutral300";
  const percentage = Math.floor((progress / threshold) * 100);
  const remainingProgress = threshold - progress;

  return (
    <div className={`p-8 m-2 rounded-lg shadow-md ${bgColor} flex flex-col items-center flex-grow`}>
      <img src={image} alt="Badge" className="mb-4 w-[200px] bouncy" />
      <h1 className="text-xl font-bold mb-4 pr-4 text-DarkNeutral1000 text-center">{name}</h1>
      <p className="text-DarkNeutral1100 pr-4 mb-4 text-center">{description}</p>
      {achieved ? (
        <div className="flex flex-col items-center">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <div className="text-DarkNeutral1000 font-semibold italic">+{points}XP</div>
        </div>
      ) : (
        <>
          <p>Sorry, we are experiencing some issues right now.</p>
          {/* <div className="flex justify-between mb-1 w-full">
            <span className="text-sm font-medium text-DarkNeutral1000">0</span>
            <span className="text-sm font-medium text-DarkNeutral1000">{threshold}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 text-DarkNeutral1000">
            <div
              className="bg-blue-600 h-2.5 rounded-full text-DarkNeutral1000"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-DarkNeutral1000 text-center">
            You only need {remainingProgress} more commits to achieve this! Achieving this badge gives you {points}XP!
          </div> */}
        </>
      )}
    </div>
  );
};

export default BadgeCard;
