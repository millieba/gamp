import { NextResponse } from 'next/server';
import { options } from '../../auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { getCommitCountFromDB } from '../commitsService';

export const GET = async () => {
    try {
        const session = await getServerSession(options)
        if (!session || !session.user.githubAccountId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const commitCount = await getCommitCountFromDB(session.user.githubAccountId);
        return NextResponse.json(commitCount, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}