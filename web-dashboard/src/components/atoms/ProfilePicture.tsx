import { useState } from 'react';
import { useSession } from "next-auth/react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const ProfilePicture = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/badges');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {session?.user?.image
        ? (
          <img
            src={session?.user?.image}
            alt="Github profile picture"
            className="rounded-full w-24 h-24 mt-9 shadow-sm"
          />)
        : (
          "No photo available")}
      <span className="text-lg font-semibold mt-3">{session?.user?.name}</span>
      <span className="text-sm font-medium italic mt-2">Budding learner</span>
      <div className="flex justify-between w-full mt-2">
        <span className="text-sm font-medium">2</span>
        <span className="text-sm font-medium">3</span>
      </div>

      <div className="w-full bg-DarkNeutral350 rounded-full h-2.5 mb-12">
        <div className="bg-Magenta600 h-2.5 rounded-full w-1/2"></div>
        <span className="text-xs font-medium">
          You need 499XP to reach level 3!
        </span>
      </div>

      <button
        onClick={handleClick}
        className="flex items-center justify-center text-DarkNeutral1100 font-semibold mb-4 px-4 py-2 relative rounded-full bg-Magenta600 hover:bg-pink-600"
      >
        <ArrowPathIcon className={`text-DarkNeutral1100 h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing ...' : 'Sync'}
      </button>
    </div>
  );
};

export default ProfilePicture;