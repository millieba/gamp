"use client";
import RecentIssues from "@/components/molecules/issues/RecentIssues";
import { useSyncContext } from "@/contexts/SyncContext";
import { useSession } from "next-auth/react";
import RecentAndApproachingBadges from "@/components/atoms/home/RecentAndApproachingBadges";

const HomePage = () => {
  const { data: session, status } = useSession();
  const { stats, isLoading } = useSyncContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">{`Welcome, ${session?.user?.name}!`}</h2>
      <div className="mb-5">
        <RecentIssues stats={stats} />
      </div>
      <div>
        <RecentAndApproachingBadges />
      </div>
    </>
  );
};

export default HomePage;
