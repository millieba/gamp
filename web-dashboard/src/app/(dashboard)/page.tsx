"use client";
import { useSession } from "next-auth/react";

const HomePage = () => {
  const { data: session, status } = useSession();

  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">{`Welcome, ${session?.user?.name}!`}</h2>
    </>
  )
}

export default HomePage;