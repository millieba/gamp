"use client";
import StatPreview from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";
import RecentIssues from "@/components/molecules/issues/RecentIssues";
import { useSession } from "next-auth/react";
import RecentAndApproachingBadges from "@/components/atoms/home/RecentAndApproachingBadges";

const HomePage = () => {
  const { data: session, status } = useSession();
  const { stats, isLoading } = useSyncContext();

  // Loading when site is fetching
  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="mr-4">
        <h1 className="text-2xl mb-5">{`Welcome, ${session?.user?.name}!`}</h1>
        <StatPreview />
        <div className="flex flex-wrap">
          <div className="mr-5 mb-5">
            <RecentIssues stats={stats} />
          </div>
          <div className="max-w-[350px] mb-5">
            <RecentAndApproachingBadges />
          </div>
        </div>
      </div>
    );
  }
};

export default HomePage;
