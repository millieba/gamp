"use client";
import StatBox from "@/components/atoms/StatBox";
import LanguageChart from "@/components/atoms/LanguageChart";
import { useSyncContext } from "@/contexts/SyncContext";

const StatsPage = () => {
  const { isLoading } = useSyncContext();

  return (
    <>
      <h1 className="text-2xl">Stats</h1>
      {isLoading ? <p>Loading...</p> 
      : 
      <StatBox
        name={"Most used languages"}
        description={
          "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
        }
        content={<LanguageChart />}
        maxWidth="500px"
      />
      }
      </>
      /* <p>
        You have access to {numberOfRepos} repositories on GitHub.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4">
        {fetchedData.map((repo: RepositoryDetails, index: number) => (
          <StatBox
            key={index}
            name={`${repo.owner}/${repo.name}`}
            description={repo.description}
          />
        ))}
      </div>
    </> */
  );
};

export default StatsPage;
