"use client";
import StatBox from "@/components/atoms/StatBox";
import LanguageChart from "@/components/atoms/LanguageChart";
import { useSyncContext } from "@/contexts/SyncContext";
import FactBox from "@/components/atoms/FactBox";

const StatsPage = () => {
  const { badges, isLoading } = useSyncContext();

  return (
    <>
      <h1 className="text-2xl">Stats</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <FactBox
              subheading="Total Badges"
              heading="Badges"
              number={badges?.length || 0}
              description="You have achieved this on an average!"
              maxWidth="300px"
            />
          </div>
          <StatBox
            name={"Most used languages"}
            description={
              "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
            }
            content={<LanguageChart />}
            maxWidth="500px"
          />
        </>
      )}
    </>
  );
};

export default StatsPage;
