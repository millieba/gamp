"use client";
import StatPreview from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";
import RecentIssues from "@/components/molecules/issues/RecentIssues";
import { useSession } from "next-auth/react";
import RecentBadges from "@/components/molecules/home/RecentBadges";
import ApproachingBadges from "@/components/molecules/home/ApproachingBadges";
import ContributionChartWrapper from "@/components/molecules/ContributionsChartWrapper";
import PageHeading from "@/components/atoms/PageHeading";

const HomePage = () => {
  const { data: session, status } = useSession();
  const { stats, isLoading } = useSyncContext();

  // Loading when site is fetching
  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        <PageHeading title={`Welcome, ${session?.user?.name}!`} />
        <div className="flex flex-wrap gap-5">
          <StatPreview />
          <div className="flex-grow">
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
      </>
    );
  }
};

export default HomePage;
