"use client";
import HomeSkeleton from "@/components/molecules/skeleton/HomeSkeleton";
import { useSyncContext } from "@/contexts/SyncContext";
import { useSession } from "next-auth/react";

const HomePage = () => {
  const { data: session, status } = useSession();
  const { isLoading } = useSyncContext();

  return (
    <>
      {isLoading || !session?.user?.name ? (
        <HomeSkeleton />
      ) : (
        <>
          <h1 className="text-2xl">Home</h1>
          <h2 className="text-xl">{`Welcome, ${session?.user?.name}!`}</h2>
        </>
      )}
    </>
  );
};

export default HomePage;
