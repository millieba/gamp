"use client";
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

export default ProfilePage;