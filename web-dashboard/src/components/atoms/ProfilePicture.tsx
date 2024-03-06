import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useSyncContext, sync } from "@/contexts/SyncContext";
import { redirect } from "next/navigation";

const ProfilePicture = () => {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string>();
  const { setIsLoading, setBadges, setAllBadges, setStats, setLevel, isLoading, level } = useSyncContext();

  const handleClick = async () => {
    try {
      await sync(setIsLoading, setBadges, setAllBadges, setStats, setLevel);
    } catch (err) {
      err instanceof Error && setError(err.message);
      console.error(err);
    }
  };

  const calculateProgressBarPercentage = () => {
    if (!level?.nextLevel) {
      return 100; // User is already at the highest level
    }
    const pointsNeeded = level.nextLevel.threshold - level.totalPoints;
    const progressPercentage = ((level.currentLevel.threshold - pointsNeeded) / level.currentLevel.threshold) * 100;
    return Math.min(progressPercentage, 100).toFixed(); // Cap at 100% just in case, remove decimals
  };

  useEffect(() => {
    if (status === "unauthenticated" || session?.error === "RefreshAccessTokenError") {
      redirect("/api/auth/signin"); // Redirect to the sign in page if the user is unauthenticated or their access token has expired
    }
  }, [session, status]);

  return (
    <div className="flex flex-col items-center">
      {/* Profile picture, name and level name */}
      {session?.user?.image ? (
        <img
          src={session?.user?.image}
          alt="Github profile picture"
          className="rounded-full w-24 h-24 mt-9 shadow-sm"
        />
      ) : (
        "No photo available"
      )}
      <span className="text-lg font-semibold mt-3 mb-1">{session?.user?.name}</span>
      <span className="italic">{level?.currentLevel?.name}</span>

      {/* Container for star and progress bar */}
      <div className="flex items-center w-full mb-4 mt-6">
        {/* Star with level number inside */}
        <div className="relative mr-[-1em] z-10 mt-[-0.4em]">
          <StarIcon className="w-11 h-11 text-sky-800 stroke-sky-400 stroke-[0.2px]" />
          <span className="absolute inset-0 flex items-center justify-center text-sm text-bold mb-[-0.2em]">
            {level?.currentLevel && level.currentLevel.id}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-grow bg-DarkNeutral350 rounded-full h-5 relative">
          <div className={`bg-Magenta600 h-full rounded-full w-[${calculateProgressBarPercentage()}%]`}></div>
          {/* Text about max level reached */}
          <span className="absolute inset-x-0 inset-y-3 flex items-center justify-center text-xs font-thin">
            {level?.nextLevel ? `${level.totalPoints}/${level.nextLevel.threshold} XP` : "Max level reached!"}
          </span>
        </div>
      </div>

      {/* Text about closest level */}
      <span className="ml-2 text-xs font-medium">
        {level?.nextLevel
          ? `Earn ${level.nextLevel.threshold - level.totalPoints} XP more to reach level ${level.nextLevel.id}!`
          : `You're already ${
              level?.currentLevel && level?.totalPoints - level?.currentLevel?.threshold
            } XP above the highest level!`}
      </span>

      {/* Sync button */}
      <button
        onClick={handleClick}
        className="mt-5 flex items-center justify-center text-DarkNeutral1100 font-semibold mb-4 px-4 py-2 relative rounded-full bg-Magenta600 hover:bg-pink-600"
      >
        <ArrowPathIcon className={`text-DarkNeutral1100 h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Syncing ..." : "Sync"}
      </button>
    </div>
  );
};

export default ProfilePicture;
