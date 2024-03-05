import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
      <span className="text-lg font-semibold mt-3">{session?.user?.name}</span>
      <span className="text-sm font-medium italic mt-2">Budding learner</span>
      <div className="flex justify-between w-full mt-2">
        <span className="text-sm font-medium">{level?.currentLevel?.id}</span>
        <span className="text-sm font-medium">{level?.nextLevel?.id}</span>
      </div>

      <div className="w-full bg-DarkNeutral350 rounded-full h-2.5 mb-12">
        <div className="bg-Magenta600 h-2.5 rounded-full w-1/2"></div>
        <span className="text-xs font-medium">You need {level?.nextLevel?.threshold}XP to reach level 3!</span>
      </div>

      <button
        onClick={handleClick}
        className="flex items-center justify-center text-DarkNeutral1100 font-semibold mb-4 px-4 py-2 relative rounded-full bg-Magenta600 hover:bg-pink-600"
      >
        <ArrowPathIcon className={`text-DarkNeutral1100 h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Syncing ..." : "Sync"}
      </button>
    </div>
  );
};

export default ProfilePicture;
