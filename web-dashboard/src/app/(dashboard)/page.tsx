"use client";
import StatPreview from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";
import RecentIssues from "@/components/molecules/issues/RecentIssues";
import { useSession } from "next-auth/react";
import RecentBadges from "@/components/atoms/home/RecentBadges";
import ApproachingBadges from "@/components/atoms/home/ApproachingBadges";
import ContributionChart from "@/components/atoms/ContributionChart";
import StatCard from "@/components/atoms/StatCard";

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
            <StatCard
              name={"Contributions"}
              description={
                "In the chart below, you can see your GitHub contribution chart for the last year. The chart shows the number of contributions per day."
              }
              content={<ContributionChart />}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default HomePage;
