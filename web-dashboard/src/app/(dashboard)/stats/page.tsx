"use client";
import StatBox from "@/components/atoms/StatBox";
import { useEffect, useState } from "react";
import { RepositoryDetails } from "@/utils/types";
import FetchLanguages from "@/components/atoms/FetchLanguages";
import { useSyncContext } from "@/contexts/SyncContext";

const StatsPage = () => {
  const [fetchedData, setFetchedData] = useState<RepositoryDetails[]>();
  const [error, setError] = useState<Boolean>(false);
  const { stats, isLoading } = useSyncContext();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/api/repositories");
        const data = await response.json();
        const dataDict: RepositoryDetails[] =
          data.repos?.data.map(
            (repo: { name: string; description: string }) => ({
              name: repo.name,
              description: repo.description,
            })
          ) || [];
        setFetchedData(dataDict);
      } catch (error) {
        setError(true);
      }
    };
    getData();
  }, []);

  if (error) return <div>There was an error</div>;

  if (!fetchedData) return <div>Loading...</div>;

  const numberOfRepos = fetchedData.length;

  return (
    <>
      <h1 className="text-2xl">Stats</h1>
      <StatBox
        name={"Most used languages"}
        description={
          "The following chart shows the most used languages used in the repositories you have a connection to. The data is calculated from the number bytes written in each language."
        }
        content={<FetchLanguages />}
        maxWidth="500px"
      />
      <p>
        You have access to {numberOfRepos} repositories on GitHub.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4">
        {fetchedData.map((repo: { name: string, description: string }, index: number) => (
          <StatBox
            key={index}
            name={repo.name}
            description={repo.description}
          />
        ))}
      </div>
    </>
  );
};

export default StatsPage;
