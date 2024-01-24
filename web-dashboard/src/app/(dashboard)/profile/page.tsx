"use client";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";
=======
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const ProfilePage = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.error === "RefreshAccessTokenError") {
            signOut();
        }
    }, [session, status]);
    return <h1 className="text-2xl">Profile</h1>
}
>>>>>>> 9df5bcbe5f9ca561681effa9d510688d6d45bd0e

const ProfilePage = () => {
  const [languages, setLanguages] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const loadMore = () => {
    const hasNextPage = languages?.repositories?.pageInfo?.hasNextPage;
    const endCursor = languages?.repositories?.pageInfo?.endCursor;
    if (hasNextPage && endCursor) {
      fetchData();
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (
    !languages ||
    !languages.repositories ||
    languages.repositories.edges.length === 0
  ) {
    return <div>No repositories available</div>;
  }

  const repositoriesPageInfo = languages?.repositories?.pageInfo;

  return (
    <div>
      <h1 className="text-2xl">Profile</h1>
      <ul>
        {languages.repositories.edges.map(
          (
            edge: any,
            index: number // Updated to use edges
          ) => (
            <li key={index}>
              <div>
                Repository: {edge.node.name}, Owner: {edge.node.owner.login}
              </div>
              {edge.node.languages.edges.length > 0 && (
                <ul>
                  {edge.node.languages.edges.map((language: any) => (
                    <li key={language.node.name}>
                      Language: {language.node.name}, Size: {language.size}
                    </li>
                  ))}
                </ul>
              )}
              {edge.node.languages.pageInfo?.hasNextPage ? (
                <p>
                  Yes, there are more languages to display for this repository
                </p>
              ) : (
                <p>No more languages for this repository</p>
              )}
            </li>
          )
        )}
      </ul>
      {repositoriesPageInfo?.hasNextPage ? (
        <button onClick={loadMore}>Load more</button>
      ) : (
        <p>That's about it :D</p>
      )}
    </div>
  );
};

export default ProfilePage;
