"use client";
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";

const ProfilePage = () => {
  const [languages, setLanguages] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/languages/");
        const data = await response.json();

        if (response.ok) {
          console.log(data.languages);
          setLanguages(data.languages);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
        setError("An error occurred while fetching data");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (
    !languages ||
    !languages.repositories ||
    languages.repositories.nodes.length === 0
  ) {
    return <div>No repositories available</div>;
  }

  const repositoriesPageInfo = languages?.repositories?.pageInfo;

  return (
    <div>
      <h1 className="text-2xl">Profile</h1>
      <ul>
        {languages.repositories.nodes.map((repository: any, index: number) => (
          <li key={index}>
            <div>
              Repository: {repository.name}, Owner: {repository.owner.login}
            </div>
            {repository.languages.edges.length > 0 && (
              <ul>
                {repository.languages.edges.map((language: any) => (
                  <li key={language.node.name}>
                    Language: {language.node.name}, Size: {language.size}
                  </li>
                ))}
              </ul>
            )}
            {repository.languages.pageInfo?.hasNextPage ? (
                <p>
                  Yes, there are more languages to display for this repository
                </p>
              ) : (
                <p>No more languages for this repository</p>
              )}
          </li>
        ))}
      </ul>
      {repositoriesPageInfo?.hasNextPage ? (
        <button>Load more</button>
      ) : (
        <p>thats about that :D</p>
      )}
    </div>
  );
};

export default ProfilePage;
