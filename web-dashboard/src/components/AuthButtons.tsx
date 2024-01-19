"use client";

import { signIn, signOut } from "next-auth/react";

export const SignInButton = () => {
    return <button className="h-5 w-5 text-DarkNeutral1100 mr-3" onClick={() => signIn("github")}>Sign In</button>;
};

export const SignOutButton = () => {
    return <button className=" text-DarkNeutral1100 mr-3" onClick={() => signOut()}>Sign Out</button>;
};