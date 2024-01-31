import { NextResponse } from 'next/server';
import { options } from '../../auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { fetchRepoCount } from '../repoService';

export const GET = async () => {
    const session = await getServerSession(options)

    if (!session || !session.user.githubAccountId) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    
    try {
        const repoCount = await fetchRepoCount(session.user.githubAccountId);
        console.log(repoCount);
        return NextResponse.json(repoCount, { status: 200 });
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}