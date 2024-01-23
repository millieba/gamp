import { getCommitsCount } from "../commitsService";

export const GET = async () => {
    const commitsCount = await getCommitsCount();
    return commitsCount;
};