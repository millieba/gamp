"use client";
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";
import { useSession, signOut } from "next-auth/react";

const FetchLanguages = () => {
  const { data: session, status } = useSession();
  const [repositories, setRepositories] = useState<QueryResult['user']['repositories']['nodes'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [languageSizes, setLanguageSizes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (status === 'authenticated' && session?.error === "RefreshAccessTokenError") {
      signOut();
    }
  }, [session, status]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/languages/");
      const data = await response.json();

      if (response.ok) {
        setRepositories(data.languages);

        // Calculate language sizes
        const sizes: { [key: string]: number } = {};
        data.languages.forEach((repo: any) => {
          repo.node.languages.edges.forEach((language: any) => {
            if (sizes[language.node.name]) {
              sizes[language.node.name] += language.size;
            } else {
              sizes[language.node.name] = language.size;
            }
          });
        });
        setLanguageSizes(sizes);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
      setError("An error occurred while fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
        <h1>Brief overview (to use in graphs etc.)</h1>
        {Object.entries(languageSizes).map(([language, size], index) => (
        <p key={index}>{language}: {size}</p>
      ))}
        <br></br>
        <h1>General data fetched</h1>
      {repositories && repositories.map((repo, index) => (
        <div key={index}>
          <h2>Repository: {repo.node.name}</h2>
          <h3>Owner: {repo.node.owner.login}</h3>
          {repo.node.languages.edges.length > 0 ? (
            <ul>
              {repo.node.languages.edges.map((language, index) => (
                <li key={index}>Language: {language.node.name}, Size: {language.size}</li>
              ))}
            </ul>
          ) : (
            <p>No languages for this repository</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FetchLanguages;