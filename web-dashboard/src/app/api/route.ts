import { NextResponse } from "next/server";
import { isAuthenticated } from "@/utils/auth";

export async function GET(request: Request) {
    return (await isAuthenticated()).authenticated 
        ? new NextResponse(JSON.stringify({ authenticated: true }), { status: 200, headers: { "Content-Type": "application/json" } })
        : NextResponse.redirect(`${process.env.NEXTAUTH_URL}/api/auth/signin`);
}