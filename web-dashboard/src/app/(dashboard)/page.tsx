"use client";
import BadgesHomePage from "@/components/atoms/home/BadgesHomePage";
import StreakView from "@/components/molecules/streak/StreakView";
import { useSyncContext } from "@/contexts/SyncContext";
import { useSession } from "next-auth/react";

const HomePage = () => {
  const { data: session } = useSession();
  const { isLoading } = useSyncContext();

  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="w-screen">
        <div className={`p-4max-w-screen-xl grid sm:grid-cols-1 md:grid-cols-3 gap-4 justify-between mb-4`}>
          <StreakView title="Workday Streak" children="dayz" description="Streak on workdays" />

          <StreakView title="Strict Streak" children="nothing" description="Strict Streakz" />

          <StreakView title="Most recent badge" children="Pull Request Expert" description="yaas queen slay" />
        </div>
        {/* </div> */}
        <div className="max-w-[350px]">
          <BadgesHomePage />
        </div>
      </div>
    );
  }
};

export default HomePage;
