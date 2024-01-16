"use client";

import { signIn, signOut } from "next-auth/react";

export const SignInButton = () => {
    return <button onClick={() => signIn()}>Sign in</button>;
};

export const SignOutButton = () => {
    return <button onClick={() => signOut()}>Sign out</button>;
};