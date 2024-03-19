"use client";
import BadgesHomePage from "@/components/atoms/home/BadgesHomePage";
import StatPreview from "@/components/molecules/home/StatPreview";
import { useSyncContext } from "@/contexts/SyncContext";

const HomePage = () => {
  const { isLoading } = useSyncContext();

  // Loading when site is fetching
  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div className="mr-4">
        <StatPreview />
        <div className="flex flex-wrap max-w-[350px]">
          <BadgesHomePage />
        </div>
      </div>
    );
  }
};

export default HomePage;
