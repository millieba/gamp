import { ClockIcon, PuzzlePieceIcon, SparklesIcon, StarIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface InfoDetails {
  icon: string;
  heading: string;
  subheading: string;
  number: number;
  unit: string;
  description?: string;
  maxWidth?: string; // remember to specify the unit when using this prop
}

const InfoCard: React.FC<InfoDetails> = ({ icon, heading, subheading, number, unit, description, maxWidth }) => {
  const gradientColor = "bg-DarkNeutral300";
  return (
    <div
      className={`p-8 m-2 rounded-lg shadow-md ${gradientColor} overflow-visible overflow-wrap-anywhere`}
      style={{ maxWidth: maxWidth ? maxWidth : "" }}
    >
      <div className="flex items-center mb-1">
        {icon === "clock" && <ClockIcon className="h-5 w-5 mr-2 text-DarkNeutral1000" />}
        {icon === "puzzle" && <PuzzlePieceIcon className="h-5 w-5 mr-2 text-DarkNeutral1000" />}
        {icon === "sparkles" && <SparklesIcon className="h-5 w-5 mr-2 text-DarkNeutral1000" />}
        {icon === "star" && <StarIcon className="h-5 w-5 mr-2 text-DarkNeutral1000" />}
        <p className="text-DarkNeutral1000 font-semibold">{heading}</p>
      </div>
      <div className="flex">
        <h1 className="text-2xl font-bold pr-4 text-DarkNeutral1100">
          {number} {unit}
        </h1>
      </div>
      <p className="text-Teal600 font-bold">{subheading}</p>
      <p className="text-DarkNeutral1100 pr-4">{description}</p>
    </div>
  );
};

export default InfoCard;
