"use client";
import { useEffect, useState } from "react";
import { QueryResult } from "@/app/api/languages/route";
import { useSession, signOut } from "next-auth/react";


const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [repositories, setRepositories] = useState<QueryResult['user']['repositories']['nodes'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
        console.log(data.languages);
        setRepositories(data.languages);
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

  console.log(repositories);

  return (
    <div>
      <h1 className="text-2xl">Profile</h1>
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

export default ProfilePage;