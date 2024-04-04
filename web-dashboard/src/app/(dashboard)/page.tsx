"use client";
import StatPreview, { StatPreviewSkeleton } from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";
import RecentIssues, { RecentIssuesSkeleton } from "@/components/molecules/issues/RecentIssues";
import { useSession } from "next-auth/react";
import RecentBadges, { RecentBadgesSkeleton } from "@/components/molecules/home/RecentBadges";
import ApproachingBadges, { ApproachingBadgesSkeleton } from "@/components/molecules/home/ApproachingBadges";
import ContributionChartWrapper, {
  ContributionChartWrapperSkeleton,
} from "@/components/molecules/ContributionsChartWrapper";
import PageHeading, { PageHeadingSkeleton } from "@/components/atoms/PageHeading";
import QuoteBox, { QuoteBoxSkeleton } from "@/components/molecules/home/QuoteBox";

const HomePageSkeleton = () => (
  <>
    <PageHeadingSkeleton width={"w-96"} />
    <div className="flex flex-wrap gap-5 mb-4">
      <StatPreviewSkeleton />
      <div className="2xl:w-1/4 lg:w-1/3 md:w-full sm:w-full xs:w-full flex-grow">
        <div className="flex flex-col gap-5">
          <RecentIssuesSkeleton />
          <QuoteBoxSkeleton />
        </div>
      </div>
      <div className="flex-grow">
        <ApproachingBadgesSkeleton />
      </div>
      <div className="flex-grow">
        <RecentBadgesSkeleton />
      </div>
    </div>
    <ContributionChartWrapperSkeleton />
  </>
);

const HomePage = () => {
  const { data: session, status } = useSession();
  const { stats, isLoading } = useSyncContext();

  if (isLoading) {
    return <HomePageSkeleton />;
  } else {
    return (
      <>
        <PageHeading title={`Welcome, ${session?.user?.name}!`} />
        <div className="flex flex-wrap gap-5 mb-4">
          <StatPreview />
          <div className="2xl:w-1/4 lg:w-1/3 md:w-full sm:w-full xs:w-full flex-grow">
            <div className="flex flex-col gap-5">
              <RecentIssues stats={stats} />
              <QuoteBox />
            </div>
          </div>
          <div className="flex-grow">
            <ApproachingBadges />
          </div>
          <div className="flex-grow">
            <RecentBadges />
          </div>
        </div>
        <ContributionChartWrapper />
      </>
    );
  }
};

export default HomePage;
