import { Octokit } from 'octokit';

const HomePage = async () => {

  // TODO: Replace the auth with a personal access token from a personal .env file
  const octokit = new Octokit({
    auth: 'replaceThisWithYourOwnPersonalAccessToken'
  });

  // So far its only working on repos that you own yourself
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: "karenvi",
      repo: "it3023-statistics",
    });

    console.log(result);
  } catch (error) {
    console.log("Did not work. Did you make sure to change 'owner' and 'repo' to a project you own and the personal auth token?")
  }

    
  return <h1 className="text-2xl">Home</h1>
}

export default HomePage;