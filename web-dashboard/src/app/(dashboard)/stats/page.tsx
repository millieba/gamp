"use client"
import { get } from "http";
import { useEffect, useState } from "react";

const StatsPage = () => {
    const [fetchedData, setFetchedData] = useState<any>();
    const [error, setError] = useState<Boolean>(false);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch("/api/commits");
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
    
    return (
        <>
        <h1 className="text-2xl">
            Stats
        </h1>
        <div>
            {fetchedData &&
        <ul>
          {fetchedData.repos?.data.map((repo: any) => (
            <li key={repo.id}>
              <p>Repository Name: {repo.name}</p>
            </li>
          ))}
        </ul>}
        </div>
        </>
    );

}

export default StatsPage;