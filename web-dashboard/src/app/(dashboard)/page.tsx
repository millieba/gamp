import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";

const HomePage = async () => {
  const session = await getServerSession(options)
  return (
    <>
      <h1 className="text-2xl">Home</h1>
      <h2 className="text-xl">Welcome {JSON.stringify(session)}</h2>
    </>
  )
}

export default HomePage;