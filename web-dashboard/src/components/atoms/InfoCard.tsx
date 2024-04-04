import {
  ClockIcon,
  InformationCircleIcon,
  LanguageIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

export interface InfoDetails {
  icon: string;
  heading: string;
  subheading: string;
  number: number;
  unit: string;
  description: string;
  iconColour?: string;
}
interface InfoCardSkeletonProps {
  headingWidth?: string;
  numberUnitWidth?: string;
  subheadingWidth?: string;
}

export const InfoCardSkeleton: React.FC<InfoCardSkeletonProps> = ({
  headingWidth = "w-24",
  numberUnitWidth = "w-32",
  subheadingWidth = "w-52",
}) => {
  return (
    <div className="p-8 rounded-lg shadow-md bg-DarkNeutral100 overflow-visible overflow-wrap-anywhere min-w-[250px]">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          {/* Icon, e.g. fire icon */}
          <div className="h-6 w-6 bg-DarkNeutral300 rounded-full animate-pulse mr-2"></div>
          {/* Heading */}
          <div className={`h-5 ${headingWidth} bg-DarkNeutral300 rounded-full animate-pulse`}></div>
        </div>
        {/* Information icon in right top corner */}
        <div className="h-5 w-5 bg-DarkNeutral300 rounded-full animate-pulse"></div>
      </div>
      <div className="flex">
        {/* Number + unit */}
        <div className={`h-6 ${numberUnitWidth} bg-DarkNeutral300 rounded-full animate-pulse mb-2`}></div>
      </div>
      {/* Subheading */}
      <div className={`h-4 ${subheadingWidth} bg-DarkNeutral300 rounded-full animate-pulse`}></div>
    </div>
  );
};

const InfoCard: React.FC<InfoDetails> = ({
  icon,
  heading,
  subheading,
  number,
  unit,
  description,
  iconColour = "DarkNeutral1000", // Optional prop, default value is DarkNetral1100
}) => {
  const [hover, setHover] = useState(false);

  const iconComponents: { [key: string]: React.ElementType } = {
    clock: ClockIcon,
    puzzle: PuzzlePieceIcon,
    sparkles: SparklesIcon,
    star: StarIcon,
    language: LanguageIcon,
    fire: FireIcon,
    command: CommandLineIcon,
  };

  const IconComponent = iconComponents[icon];

  return (
    <div className={`p-8 rounded-lg shadow-md bg-DarkNeutral100 overflow-visible overflow-wrap-anywhere min-w-[250px]`}>
      <div className="flex items-center mb-1 justify-between">
        <div className="flex items-center">
          {IconComponent && <IconComponent className={`h-5 w-5 mr-2 ${iconColour}`} />}
          <p className="text-DarkNeutral1000 font-semibold">{heading}</p>
        </div>
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative">
          <InformationCircleIcon className="h-5 w-5" />
          {hover && (
            <div className="absolute right-0 bg-DarkNeutral400 text-DarkNeutral1000 p-2 rounded-md shadow-lg z-50 min-w-[200px]">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex">
        <h1 className="text-2xl font-bold pr-4 text-DarkNeutral1100">
          {number} {unit}
        </h1>
      </div>
      <p className="text-Teal600 font-bold">{subheading}</p>
    </div>
  );
};

export default InfoCard;
