import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid"; // Assuming there's a StarIcon available
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
    return Math.min(progressPercentage, 100); // Cap at 100% just in case
  };

  useEffect(() => {
    if (status === "unauthenticated" || session?.error === "RefreshAccessTokenError") {
      redirect("/api/auth/signin"); // Redirect to the sign in page if the user is unauthenticated or their access token has expired
    }
  }, [session, status]);

  return (
    <div className="flex flex-col items-center">
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
      <span className="italic mb-8">{level?.currentLevel?.name}</span>

      <div className="flex items-center w-full bg-DarkNeutral350 rounded-full h-4.5 mb-4 ml-4">
        <div className="absolute w-9 h-9 bg-sky-800 font-thin left-2 rounded-full">
          <div className="left-3 top-1.5 relative content-center">
            {level?.nextLevel?.id ? level.nextLevel.id : level?.currentLevel.id}
          </div>
        </div>

        <div className="bg-Magenta600 h-4.5 rounded-full" style={{ width: `${calculateProgressBarPercentage()}%` }}>
          <span className="text-xs align-text-bottom ml-16 font-thin">
            {level?.nextLevel ? `${level.totalPoints}/${level.nextLevel.threshold} XP` : "Max level reached!"}
          </span>
        </div>
      </div>

      <span className="text-xs font-medium">
        {level?.nextLevel
          ? `Earn ${level.nextLevel.threshold - level.totalPoints} XP more to reach level ${level.nextLevel.id}!`
          : `You're already ${
              level?.currentLevel && level?.totalPoints - level?.currentLevel?.threshold
            } XP above the highest level!`}
      </span>

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
