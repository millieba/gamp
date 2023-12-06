"use client"
import StatBox from "@/components/atoms/StatBox";
import { useEffect, useState } from "react";

const StatsPage = () => {
    const [fetchedData, setFetchedData] = useState<any>();
    const [error, setError] = useState<Boolean>(false);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch("/api/repositories");
                const data = await response.json();
                setFetchedData(data);
            } catch (error) {
                setError(true);
            }
        }
        getData();
    }, []);

    if (error) return (<div>There was an error</div>);

    if (!fetchedData) return (<div>Loading...</div>);

    const numberOfRepos = fetchedData.repos?.data.length;
    
    return (
        <>
        <h1 className="text-2xl">
            Stats
        </h1>
        <p>Below the public repositories that you own (either created or forked), or starred are displayed. You have {numberOfRepos} public repositories.</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4'>
          {fetchedData.repos?.data.map((repo: any) => (
              <StatBox title={repo.name} description={repo.description} />
          ))}
          </div>
        </>
    );

}

export default StatsPage;