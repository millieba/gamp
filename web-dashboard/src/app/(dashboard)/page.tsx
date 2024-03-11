"use client";
import BadgesHomePage from "@/components/atoms/home/BadgesHomePage";
import { useSyncContext } from "@/contexts/SyncContext";
import { useSession } from "next-auth/react";

const HomePage = () => {
  const { data: session } = useSession();
  const { isLoading } = useSyncContext();

  if (isLoading) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        <h1 className="text-2xl">Home</h1>
        <h2 className="text-xl">{`Welcome, ${session?.user?.name}!`}</h2>
        <BadgesHomePage />
      </>
    );
  }
};

export default HomePage;
