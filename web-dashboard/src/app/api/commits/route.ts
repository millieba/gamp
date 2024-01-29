import { getAllCommits } from "./commitsService";

export const GET = async () => {
    const commits = await getAllCommits();
    return commits;
};
