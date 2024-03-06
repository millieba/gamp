import { CheckCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface BadgeDetails {
  name: string;
  image: string;
  description: string;
  points: number;
  progress: number;
  threshold: number;
  achieved: boolean;
  date?: Date;
}

const BadgeCard: React.FC<BadgeDetails> = ({
  name,
  image,
  description,
  points,
  progress,
  threshold,
  achieved,
  date,
}) => {
  const bgColor = "bg-DarkNeutral300";
  const percentage = Math.floor((progress / threshold) * 100);

  return (
    <div
      className={`p-8 m-2 rounded-lg shadow-md ${bgColor} flex flex-col justify-between items-center w-[300px] h-[500px]`}
    >
      <img src={image} alt="Badge" className="mb-4 w-[200px] bouncy" />
      <h1 className="text-xl font-bold mb-4 pr-4 text-DarkNeutral1000 text-center">{name}</h1>
      <p className="text-DarkNeutral1100 pr-4 mb-4 text-center">{description}</p>

      {achieved ? (
        <div className="flex flex-col items-center">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <div className="text-DarkNeutral1000 font-semibold italic">+{points}XP</div>
          <div className="text-DarkNeutral1000 text-xs">
            Achieved: {date ? new Date(date).toISOString().split("T")[0] : ""}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full">
            <span className="text-sm font-medium text-DarkNeutral1000">0</span>
            <span className="text-sm font-medium text-DarkNeutral1000">{threshold}</span>
          </div>
          <div className="w-full bg-DarkNeutral350 rounded-full h-2.5 text-DarkNeutral1000">
            <div
              className="bg-Magenta600 h-2.5 rounded-full text-DarkNeutral1000"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-DarkNeutral1000 text-center">
            {progress}/{threshold}
          </div>
        </>
      )}
    </div>
  );
};

export default BadgeCard;
