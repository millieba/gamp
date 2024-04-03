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

interface BadgeCardHomePageSkeletonProps {
  achieved?: boolean;
}

export const BadgeCardHomePageSkeleton = ({ achieved = false }: BadgeCardHomePageSkeletonProps) => (
  <div className="p-2 rounded-lg shadow-md flex flex-row bg-DarkNeutral300 m-2">
    <div className="flex flex-col justify-center items-center">
      <div className="animate-pulse bg-DarkNeutral500 rounded-full h-[50px] w-[50px] mb-2" />
    </div>
    <div className="flex flex-col w-full ml-4">
      <div className="items-center sm:items-left">
        <div className="flex items-center">
          <div className="animate-pulse bg-DarkNeutral500 rounded-full h-4 w-3/5 mb-1" />
          {achieved && <CheckCircleIcon className="w-[18px] h-[18px] text-Lime500 ml-1 mb-1" />}
        </div>
        <div className="animate-pulse bg-DarkNeutral500 rounded-full h-3 w-11/12 mb-2" />
      </div>
      <div>
        <div className="items-center md:items-left w-full">
          <div className="flex justify-between w-full mb-1">
            {!achieved && (
              <>
                <div className="animate-pulse bg-DarkNeutral500 rounded-full h-3 w-3" />
                <div className="animate-pulse bg-DarkNeutral500 rounded-full h-3 w-3" />
              </>
            )}
          </div>
          {!achieved && <div className="w-full bg-DarkNeutral500 rounded-full h-2 items-center md:items-left"></div>}
          <div className="mt-2">
            <div className="animate-pulse bg-DarkNeutral500 rounded-full h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BadgeCardHomePage: React.FC<BadgeDetails> = ({
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

  const messages = [
    `You're only ${threshold - progress} ${threshold - progress === 1 ? unit.slice(0, -1) : unit} away!`,
    `Keep going, only ${threshold - progress} ${threshold - progress === 1 ? unit.slice(0, -1) : unit} to go!`,
    `Make ${threshold - progress} ${threshold - progress === 1 ? unit.slice(0, -1) : unit} more to achieve this`,
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  return (
    <div className={`p-2 rounded-lg shadow-md flex flex-row ${bgColor} m-2 smallBounce`}>
      <div className="flex flex-col justify-center items-center">
        <Image src={image} alt="Badge" width={50} height={50} className="mb-2" />
      </div>
      <div className="ml-4 items-center text-center sm:text-left">
        <div className="flex items-center">
          <h1 className="text-sm font-bold mb-1 text-DarkNeutral1000">
            {name} ({points} XP)
          </h1>
          {achieved && <CheckCircleIcon className="w-[18px] h-[18px] text-Lime500 ml-1 mb-1" />}
        </div>
        <p className="text-DarkNeutral1100 mb-1 text-xs">{description}</p>

        {achieved ? (
          <div className="text-DarkNeutral1000 text-xs">
            Achieved: {date ? new Date(date).toISOString().split("T")[0] : ""}
          </div>
        ) : (
          <div className="items-center text-center md:items-left md:text-left w-full">
            <div className="flex justify-between text-DarkNeutral1000 w-full">
              <span className="text-xs">0</span>
              <span className="text-xs">{threshold}</span>
            </div>
            <div className="w-full bg-DarkNeutral500 rounded-full h-1 text-DarkNeutral1000 items-center text-center md:items-left md:text-left">
              <div
                className="bg-Lime500 h-1 rounded-full text-DarkNeutral1000"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-DarkNeutral1000 text-xs mt-2 text-center md:text-left ">{randomMessage}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCardHomePage;
