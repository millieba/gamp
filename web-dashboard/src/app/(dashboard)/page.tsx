"use client";
import StatPreview from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";
import RecentIssues from "@/components/molecules/issues/RecentIssues";
import { useSession } from "next-auth/react";
import RecentBadges from "@/components/molecules/home/RecentBadges";
import ApproachingBadges from "@/components/molecules/home/ApproachingBadges";
import ContributionChartWrapper from "@/components/molecules/ContributionsChartWrapper";

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
        <div className="flex flex-wrap gap-5">
          <StatPreview />
          <div>
            <RecentIssues stats={stats} />
          </div>
          <div className="flex-grow">
            <ApproachingBadges />
          </div>
          <div className="flex-grow">
            <RecentBadges />
          </div>
          <div className="flex-grow">
            <ContributionChartWrapper />
          </div>
        </div>
      </div>
    );
  }
};

export default HomePage;
