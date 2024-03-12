import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
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

const BadgeCardHomePage: React.FC<BadgeDetails> = ({
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
    <div className={`p-2 rounded-lg shadow-md flex flex-col sm:flex-row ${bgColor} max-w-[350px] m-2`}>
      <div className="flex flex-col justify-center items-center">
        <img src={image} alt="Badge" className="mb-2 w-[50px] bouncy" />
      </div>
      <div className="ml-4 items-center text-center sm:text-left">
        <div className="flex items-center">
          <h1 className="text-sm font-bold mb-1 text-DarkNeutral1000">
            {name} ({points} XP)
          </h1>
          {achieved ? (
            <CheckCircleIcon className="w-[18px] h-[18px] text-Lime500 ml-1 mb-1" />
          ) : (
            <ClockIcon className="w-[18px] h-[18px] text-Red500 ml-1 mb-1" />
          )}
        </div>
        <p className="text-DarkNeutral1100 mb-1 text-xs">{description}</p>

        {achieved ? (
          <div className="text-DarkNeutral1000 text-xs">
            Achieved: {date ? new Date(date).toISOString().split("T")[0] : ""}
          </div>
        ) : (
          <div className="text-DarkNeutral1000 text-xs xs:text-center">{threshold - progress} unit here!!</div>
        )}
      </div>
    </div>
  );
};

export default BadgeCardHomePage;
