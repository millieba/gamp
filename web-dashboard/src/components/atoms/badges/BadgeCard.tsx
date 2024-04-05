import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export interface BadgeDetails {
  name: string;
  image: string;
  description: string;
  points: number;
  progress: number;
  threshold: number;
  achieved: boolean;
  date?: Date;
  unit?: string;
}

type BadgeCardSkeletonProps = {
  achieved: boolean; // Add achieved prop
};

export const BadgeCardSkeleton: React.FC<BadgeCardSkeletonProps> = ({ achieved }) => {
  const bgColor = "bg-DarkNeutral300";
  return (
    <div
      className={`p-8 rounded-lg shadow-md ${bgColor} flex flex-col justify-between items-center sm:flex-grow 2xl:flex-grow-0 animate-pulse`}
    >
      {/* Badge image */}
      <div className="h-[125px] w-[125px] bg-DarkNeutral400 rounded-full mb-4"></div>
      {/* Badge name */}
      <div className="w-40 h-5 bg-DarkNeutral400 rounded-full mb-4"></div>
      {/* Badge description */}
      <div className="w-44 h-4 bg-DarkNeutral400 rounded-full mb-1"></div>
      <div className="w-36 h-4 bg-DarkNeutral400 rounded-full mb-3"></div>

      {/* Render checkmark if achieved, otherwise render progress bar skeleton */}
      {achieved ? (
        <>
          {/* Green checkmark */}
          <CheckCircleIcon className="w-6 h-6 text-green-500 mb-1" />
          {/* Badge points */}
          <div className="w-24 h-4 bg-DarkNeutral400 rounded-full mb-1.5"></div>
          {/* Badge date */}
          <div className="w-32 h-3 bg-DarkNeutral400 rounded-full"></div>
        </>
      ) : (
        <>
          {/* Progress bar labels */}
          <div className="flex justify-between w-full mb-0.5">
            <div className="bg-DarkNeutral500 w-3 h-3 rounded-full" />
            <div className="bg-DarkNeutral500 w-5 h-3 rounded-full" />
          </div>
          {/* Progress bar */}
          <div className="w-full bg-DarkNeutral500 rounded-full h-2.5 mb-1" />
          {/* [Progress]/[threshold] [unit] text */}
          <div className="bg-DarkNeutral500 w-8 h-4 rounded-full mb-1" />
          {/* Badge points */}
          <div className="bg-DarkNeutral500 w-16 h-4 rounded-full" />
        </>
      )}
    </div>
  );
};

const BadgeCard: React.FC<BadgeDetails> = ({
  name,
  image,
  description,
  points,
  progress,
  threshold,
  achieved,
  date,
  unit = "",
}) => {
  const bgColor = "bg-DarkNeutral300";
  const percentage = Math.floor((progress / threshold) * 100);

  return (
    <div
      className={`p-8 rounded-lg shadow-md ${bgColor} flex flex-col justify-between items-center sm:flex-grow 2xl:flex-grow-0 smallBounce`}
    >
      <Image src={image} alt="Badge" width={125} height={125} className="mb-2" />
      <h1 className="text-lg font-bold mb-2 text-DarkNeutral1000 text-center">{name}</h1>
      <p className="text-DarkNeutral1100 mb-2 text-center text-sm">{description}</p>
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
          <div className="w-full bg-DarkNeutral500 rounded-full h-2.5 text-DarkNeutral1000">
            <div
              className="bg-Lime500 h-2.5 rounded-full text-DarkNeutral1000"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-DarkNeutral1000 text-center">
            {progress}/{threshold} {unit}
          </div>
          <div className="text-DarkNeutral1000 text-xs">Gives you {points}XP</div>
        </>
      )}
    </div>
  );
};

export default BadgeCard;
