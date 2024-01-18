import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { isAuthenticated } from "@/utils/auth";

const HomePage = async () => {
  const { authenticated, session } = await isAuthenticated() || {};

  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">{authenticated
        ? `Welcome, ${session?.user?.name}!`
        : 'Log in please!'}</h2>
      {authenticated
        ? <><SignOutButton /> {session?.user?.image && <img src={session?.user?.image} alt="Github profile picture" className="rounded-full w-24 h-24" />}</>
        : <SignInButton />}
    </>
  )
}

export default HomePage;