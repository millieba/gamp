"use client";
import { SignOutButton } from "@/components/AuthButtons";
import { getSession } from "@/utils/session";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

const HomePage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.error === "RefreshAccessTokenError") {
      signOut();
    }
  }, [session, status]);

  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">{`Welcome, ${session?.user?.name}!`}</h2>
      <SignOutButton /> {session?.user?.image && <img src={session?.user?.image} alt="Github profile picture" className="rounded-full w-24 h-24" />}
    </>
  )
}

export default HomePage;