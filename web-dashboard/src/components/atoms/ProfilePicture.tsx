import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

const ProfilePicture = async () => {
  const session = await getServerSession(options);
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
        <span className="text-sm font-medium">2</span>
        <span className="text-sm font-medium">3</span>
      </div>

      <div className="w-full bg-DarkNeutral350 rounded-full h-2.5 mb-4">
        <div className="bg-Magenta600 h-2.5 rounded-full w-1/2"></div>
        <span className="text-xs font-medium">
          You need 499XP to reach level 3!
        </span>
      </div>
    </div>
  );
};

export default ProfilePicture;
