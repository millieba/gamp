"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const SettingsPage = () => {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.error === "RefreshAccessTokenError") {
            signOut();
        }
    }, [session, status]);
    return <h1 className="text-2xl">Settings</h1>
}

export default SettingsPage;