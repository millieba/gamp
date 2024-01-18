"use client";

import { signIn, signOut } from "next-auth/react";

export const SignInButton = () => {
    return <button onClick={() => signIn("github")}>Sign in with GitHub</button>;
};

export const SignOutButton = () => {
    return <button onClick={() => signOut()}>Sign out</button>;
};