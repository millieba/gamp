import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";

// Helper function to get session information (if user is signed in)
export async function isAuthenticated() {
    const session = await getServerSession(options);
    return ({ authenticated: !!session, session })
}

