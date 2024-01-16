import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";


const HomePage = async () => {
  const session = await getServerSession(options)
  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">Welcome, {session?.user?.name}!</h2>
      <SignOutButton />
      {session?.user?.image && <img src={session?.user?.image} alt="Github profile picture" className="rounded-full w-24 h-24" />}
    </>
  )
}

export default HomePage;


